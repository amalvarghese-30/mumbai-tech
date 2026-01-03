# app.py - Main Flask Application
import os
import json
import time
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, TextAreaField, SelectField, IntegerField, DecimalField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length, NumberRange
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_mail import Mail, Message
from flask_bcrypt import Bcrypt
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv
import secrets
from functools import wraps
from functools import lru_cache


# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['MONGO_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/mumbai_tech')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@mumbai-tech.com')

# Initialize extensions
bcrypt = Bcrypt(app)
mail = Mail(app)
login_manager = LoginManager(app)
login_manager.login_view = 'admin_login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

# MongoDB connection
client = MongoClient(app.config['MONGO_URI']
    ,tls=True,
    tlsAllowInvalidCertificates=False,
    retryWrites=True,
    w='majority')
db = client.mumbai_tech

# Collections
products_collection = db.products
categories_collection = db.categories
enquiries_collection = db.enquiries
admin_users_collection = db.admin_users
activity_logs_collection = db.activity_logs

# Create indexes
products_collection.create_index([('name', 'text'), ('description', 'text')])
categories_collection.create_index([('name', 1)], unique=True)

# ========== STATS CACHE SYSTEM ==========
_stats_cache = None
_stats_cache_time = 0
CACHE_DURATION = 300  # 5 minutes in seconds

def get_admin_stats(force_refresh=False):
    """
    Get admin statistics with smart caching
    """
    global _stats_cache, _stats_cache_time
    
    current_time = time.time()
    
    # Return cached version if still valid and not forced
    if (_stats_cache and 
        not force_refresh and 
        (current_time - _stats_cache_time) < CACHE_DURATION):
        return _stats_cache
    
    try:
        # Fetch fresh stats from database
        stats = {
            'total_products': products_collection.count_documents({}),
            'total_categories': categories_collection.count_documents({}),
            'new_enquiries': enquiries_collection.count_documents({'status': 'new'}),
            'total_enquiries': enquiries_collection.count_documents({}),
            'cached_at': current_time,
            'cache_duration': CACHE_DURATION
        }
        
        # Update cache
        _stats_cache = stats
        _stats_cache_time = current_time
        
        return stats
        
    except Exception as e:
        app.logger.error(f"Failed to fetch stats: {e}")
        # Return cached version even if expired, or empty stats
        return _stats_cache or {
            'total_products': 0,
            'total_categories': 0,
            'new_enquiries': 0,
            'total_enquiries': 0,
            'error': True
        }

# Models
class AdminUser(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.username = user_data['username']
        self.email = user_data['email']
        self.role = user_data.get('role', 'admin')
        self.created_at = user_data.get('created_at', datetime.utcnow())

# ========== CONTEXT PROCESSOR ==========
@app.context_processor
def inject_template_vars():
    """
    Inject variables into ALL templates automatically
    """
    # Get stats (will use cache if available)
    stats = get_admin_stats()
    
    # Prepare common data for all templates
    template_vars = {
        'stats': stats,
        'config': {
            'app_name': 'MUMBAI-TECH',
            'current_year': datetime.now().year,
            'debug': app.config.get('DEBUG', False)
        },
        'request_endpoint': request.endpoint if request else None,
        'categories': list(categories_collection.find().sort('name', 1).limit(10))
    }
    
    # Add user info if logged in
    if current_user.is_authenticated:
        template_vars['current_user'] = {
            'username': current_user.username,
            'role': current_user.role,
            'id': current_user.id
        }
    
    return template_vars

@login_manager.user_loader
def load_user(user_id):
    user_data = admin_users_collection.find_one({'_id': ObjectId(user_id)})
    if user_data:
        return AdminUser(user_data)
    return None

# Forms
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=50)])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class ProductForm(FlaskForm):
    name = StringField('Product Name', validators=[DataRequired(), Length(min=3, max=200)])
    description = TextAreaField('Description', validators=[DataRequired(), Length(min=10)])
    category_id = SelectField('Category', coerce=str, validators=[DataRequired()])
    part_number = StringField('Part Number', validators=[DataRequired(), Length(min=3, max=100)])
    manufacturer = StringField('Manufacturer', validators=[DataRequired(), Length(min=2, max=100)])
    machine_type = StringField('Compatible Machine Type', validators=[Length(max=200)])
    technical_specs = TextAreaField('Technical Specifications')
    price = DecimalField('Estimated Price (₹)', places=2, validators=[NumberRange(min=0)])
    stock_status = SelectField('Stock Status', 
                              choices=[('in_stock', 'In Stock'), 
                                      ('limited', 'Limited Stock'),
                                      ('out_of_stock', 'Out of Stock'),
                                      ('available_soon', 'Available Soon')])
    is_featured = SelectField('Featured Product', choices=[('no', 'No'), ('yes', 'Yes')])
    images = FileField('Product Images', validators=[FileAllowed(['jpg', 'jpeg', 'png', 'gif', 'webp'])])
    submit = SubmitField('Save Product')

class CategoryForm(FlaskForm):
    name = StringField('Category Name', validators=[DataRequired(), Length(min=2, max=100)])
    description = TextAreaField('Description', validators=[Length(max=500)])
    icon_class = StringField('Icon Class (e.g., fas fa-gear)')
    submit = SubmitField('Save Category')

class EnquiryForm(FlaskForm):
    name = StringField('Your Name', validators=[DataRequired(), Length(min=2, max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    phone = StringField('Phone', validators=[DataRequired(), Length(min=10, max=15)])
    company = StringField('Company Name', validators=[Length(max=200)])
    message = TextAreaField('Enquiry Details', validators=[DataRequired(), Length(min=10)])
    product_id = StringField('Product ID')
    submit = SubmitField('Send Enquiry')

# Utility Functions
def log_activity(action, details, user_id=None):
    """Log admin activities"""
    activity = {
        'action': action,
        'details': details,
        'user_id': user_id,
        'user_name': current_user.username if current_user.is_authenticated else 'System',
        'timestamp': datetime.utcnow(),
        'ip_address': request.remote_addr
    }
    activity_logs_collection.insert_one(activity)

def save_uploaded_file(file):
    """Save uploaded file and return filename"""
    if file and file.filename:
        filename = secure_filename(file.filename)
        unique_filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        return unique_filename
    return None

def get_categories():
    """Get all categories for dropdowns"""
    categories = categories_collection.find().sort('name', 1)
    return [(str(cat['_id']), cat['name']) for cat in categories]

# Routes - Public Pages
@app.route('/')
def index():
    """Homepage"""
    featured_categories = list(categories_collection.find().limit(6))
    featured_products = list(products_collection.find({'is_featured': 'yes'}).limit(8))
    
    return render_template('public/index.html', 
                         categories=featured_categories,
                         featured_products=featured_products)

@app.route('/about')
def about():
    """About Us page"""
    return render_template('public/about.html')

@app.route('/categories')
def categories():
    """All categories page"""
    all_categories = list(categories_collection.find().sort('name', 1))
    
    # Get product count for each category
    products_count = {}
    for category in all_categories:
        count = products_collection.count_documents({'category_id': str(category['_id'])})
        products_count[str(category['_id'])] = count
    
    return render_template('public/categories.html', 
                         categories=all_categories,
                         products_count=products_count)

@app.route('/category/<category_id>')
def category_products(category_id):
    """Products in a specific category"""
    category = categories_collection.find_one({'_id': ObjectId(category_id)})
    if not category:
        flash('Category not found', 'error')
        return redirect(url_for('categories'))
    
    products = list(products_collection.find({'category_id': category_id}))
    return render_template('public/category_products.html', 
                         category=category, 
                         products=products)

@app.route('/products')
def all_products():
    """All products with filters"""
    search = request.args.get('search', '')
    category = request.args.get('category', '')
    
    query = {}
    if search:
        query['$text'] = {'$search': search}
    if category:
        query['category_id'] = category
    
    products = list(products_collection.find(query).sort('created_at', -1))
    
    # Get categories for dropdown and create dictionaries
    all_categories = list(categories_collection.find().sort('name', 1))
    category_dict = {str(cat['_id']): cat['name'] for cat in all_categories}
    categories_list = [(str(cat['_id']), cat['name']) for cat in all_categories]
    
    # Get product counts per category
    products_count = {}
    for cat in all_categories:
        count = products_collection.count_documents({'category_id': str(cat['_id'])})
        products_count[str(cat['_id'])] = count
    
    return render_template('public/products.html', 
                         products=products,
                         categories=categories_list,
                         category_dict=category_dict,
                         products_count=products_count,
                         search_query=search,
                         selected_category=category)

@app.route('/product/<product_id>')
def product_detail(product_id):
    """Product detail page"""
    product = products_collection.find_one({'_id': ObjectId(product_id)})
    if not product:
        flash('Product not found', 'error')
        return redirect(url_for('all_products'))
    
    # Get category name
    category = categories_collection.find_one({'_id': ObjectId(product['category_id'])})
    product['category_name'] = category['name'] if category else 'Uncategorized'
    
    return render_template('public/product_detail.html', product=product)

@app.route('/enquiry', methods=['GET', 'POST'])
def enquiry():
    """Submit enquiry form"""
    form = EnquiryForm()
    product_id = request.args.get('product_id', '')
    
    if product_id:
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        form.product_id.data = product_id
    
    if form.validate_on_submit():
        enquiry_data = {
            'name': form.name.data,
            'email': form.email.data,
            'phone': form.phone.data,
            'company': form.company.data,
            'message': form.message.data,
            'product_id': form.product_id.data,
            'status': 'new',
            'created_at': datetime.utcnow(),
            'ip_address': request.remote_addr
        }
        
        # Save enquiry
        enquiries_collection.insert_one(enquiry_data)
        
        # Send email notification
        try:
            msg = Message('New Product Enquiry - MUMBAI-TECH',
                         recipients=[app.config['MAIL_USERNAME']])
            msg.body = f"""
            New Enquiry Received:
            
            Name: {form.name.data}
            Email: {form.email.data}
            Phone: {form.phone.data}
            Company: {form.company.data}
            
            Message:
            {form.message.data}
            
            Product ID: {form.product_id.data if form.product_id.data else 'General Enquiry'}
            """
            mail.send(msg)
        except Exception as e:
            app.logger.error(f'Failed to send email: {str(e)}')
        
        flash('Your enquiry has been submitted successfully! We will contact you soon.', 'success')
        return redirect(url_for('index'))
    
    return render_template('public/enquiry.html', form=form, product_id=product_id)

@app.route('/search')
def search():
    """Search products"""
    query = request.args.get('q', '')
    if not query:
        return redirect(url_for('all_products'))
    
    products = list(products_collection.find(
        {'$text': {'$search': query}},
        {'score': {'$meta': 'textScore'}}
    ).sort([('score', {'$meta': 'textScore'})]).limit(50))
    
    return render_template('public/search_results.html', 
                         products=products, 
                         query=query)

# Admin Routes
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if current_user.is_authenticated:
        return redirect(url_for('admin_dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = admin_users_collection.find_one({'username': form.username.data})
        if user and bcrypt.check_password_hash(user['password'], form.password.data):
            user_obj = AdminUser(user)
            login_user(user_obj, remember=True)
            log_activity('login', f'User {form.username.data} logged in', str(user['_id']))
            flash('Logged in successfully!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('admin_dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('admin/login.html', form=form)

@app.route('/admin/logout')
@login_required
def admin_logout():
    """Admin logout"""
    log_activity('logout', f'User {current_user.username} logged out', current_user.id)
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    """Admin dashboard"""
    stats = get_admin_stats()
    
    recent_enquiries = list(enquiries_collection.find()
                           .sort('created_at', -1)
                           .limit(10))
    
    recent_activities = list(activity_logs_collection.find()
                           .sort('timestamp', -1)
                           .limit(15))
    
    return render_template('admin/dashboard.html', 
                         stats=stats,
                         recent_enquiries=recent_enquiries,
                         recent_activities=recent_activities)

@app.route('/admin/products')
@login_required
def admin_products():
    """Admin product management with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    # Get search and filter parameters
    search = request.args.get('search', '')
    category = request.args.get('category', '')
    stock_status = request.args.get('stock_status', '')
    
    # Build query
    query = {}
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'part_number': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]
    if category:
        query['category_id'] = category
    if stock_status:
        query['stock_status'] = stock_status
    
    # Calculate total for pagination
    total = products_collection.count_documents(query)
    total_pages = (total + per_page - 1) // per_page if per_page > 0 else 1
    
    # Get products with pagination
    skip = (page - 1) * per_page
    products = list(products_collection.find(query)
                   .sort('created_at', -1)
                   .skip(skip)
                   .limit(per_page))
    
    # Get categories for dropdown
    categories = list(categories_collection.find().sort('name', 1))
    category_dict = {str(cat['_id']): cat['name'] for cat in categories}
    
    # Update product count for each category in category dict
    for cat_id in category_dict:
        category_dict[cat_id] = {
            'name': category_dict[cat_id],
            'count': products_collection.count_documents({'category_id': cat_id})
        }
    
    return render_template('admin/products.html', 
                         products=products,
                         category_dict=category_dict,
                         categories=categories,
                         current_page=page,
                         total_pages=total_pages,
                         total_products=total,
                         search=search,
                         selected_category=category,
                         selected_stock=stock_status)

@app.route('/admin/product/add', methods=['GET', 'POST'])
@login_required
def add_product():
    """Add new product"""
    form = ProductForm()
    form.category_id.choices = get_categories()
    
    if form.validate_on_submit():
        product_data = {
            'name': form.name.data,
            'description': form.description.data,
            'category_id': form.category_id.data,
            'part_number': form.part_number.data,
            'manufacturer': form.manufacturer.data,
            'machine_type': form.machine_type.data,
            'technical_specs': form.technical_specs.data,
            'price': float(form.price.data) if form.price.data else 0,
            'stock_status': form.stock_status.data,
            'is_featured': form.is_featured.data,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'created_by': current_user.id
        }
        
        # Handle image upload
        images = request.files.getlist('images')
        uploaded_images = []
        for image in images:
            if image and image.filename:
                filename = save_uploaded_file(image)
                if filename:
                    uploaded_images.append(filename)
        
        if uploaded_images:
            product_data['images'] = uploaded_images
        
        # Insert product
        result = products_collection.insert_one(product_data)
        
        log_activity('add_product', 
                    f'Added product: {form.name.data}',
                    current_user.id)
        
        flash('Product added successfully!', 'success')
        return redirect(url_for('admin_products'))
    
    return render_template('admin/product_form.html', form=form, action='Add')

@app.route('/admin/product/edit/<product_id>', methods=['GET', 'POST'])
@login_required
def edit_product(product_id):
    """Edit existing product"""
    product = products_collection.find_one({'_id': ObjectId(product_id)})
    if not product:
        flash('Product not found', 'error')
        return redirect(url_for('admin_products'))
    
    form = ProductForm(obj=product)
    form.category_id.choices = get_categories()
    
    if form.validate_on_submit():
        update_data = {
            'name': form.name.data,
            'description': form.description.data,
            'category_id': form.category_id.data,
            'part_number': form.part_number.data,
            'manufacturer': form.manufacturer.data,
            'machine_type': form.machine_type.data,
            'technical_specs': form.technical_specs.data,
            'price': float(form.price.data) if form.price.data else 0,
            'stock_status': form.stock_status.data,
            'is_featured': form.is_featured.data,
            'updated_at': datetime.utcnow()
        }
        
        # Handle image upload
        images = request.files.getlist('images')
        uploaded_images = product.get('images', [])
        for image in images:
            if image and image.filename:
                filename = save_uploaded_file(image)
                if filename:
                    uploaded_images.append(filename)
        
        if uploaded_images:
            update_data['images'] = uploaded_images
        
        # Update product
        products_collection.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': update_data}
        )
        
        log_activity('edit_product', 
                    f'Edited product: {form.name.data}',
                    current_user.id)
        
        flash('Product updated successfully!', 'success')
        return redirect(url_for('admin_products'))
    
    return render_template('admin/product_form.html', form=form, product=product, action='Edit')

@app.route('/admin/product/delete/<product_id>')
@login_required
def delete_product(product_id):
    """Delete product"""
    product = products_collection.find_one({'_id': ObjectId(product_id)})
    if product:
        products_collection.delete_one({'_id': ObjectId(product_id)})
        log_activity('delete_product', 
                    f'Deleted product: {product["name"]}',
                    current_user.id)
        flash('Product deleted successfully!', 'success')
    else:
        flash('Product not found', 'error')
    
    return redirect(url_for('admin_products'))

@app.route('/admin/categories')
@login_required
def admin_categories():
    """Category management"""
    categories = list(categories_collection.find().sort('name', 1))
    
    # Add product count to each category
    for category in categories:
        category['product_count'] = products_collection.count_documents({'category_id': str(category['_id'])})
    
    return render_template('admin/categories.html', categories=categories)

@app.route('/admin/category/add', methods=['GET', 'POST'])
@login_required
def add_category():
    """Add new category"""
    form = CategoryForm()
    
    if form.validate_on_submit():
        category_data = {
            'name': form.name.data,
            'description': form.description.data,
            'icon_class': form.icon_class.data,
            'created_at': datetime.utcnow(),
            'product_count': 0
        }
        
        categories_collection.insert_one(category_data)
        
        log_activity('add_category', 
                    f'Added category: {form.name.data}',
                    current_user.id)
        
        flash('Category added successfully!', 'success')
        return redirect(url_for('admin_categories'))
    
    return render_template('admin/category_form.html', form=form, action='Add')

@app.route('/admin/category/edit/<category_id>', methods=['GET', 'POST'])
@login_required
def edit_category(category_id):
    """Edit category"""
    category = categories_collection.find_one({'_id': ObjectId(category_id)})
    if not category:
        flash('Category not found', 'error')
        return redirect(url_for('admin_categories'))
    
    form = CategoryForm(obj=category)
    
    if form.validate_on_submit():
        update_data = {
            'name': form.name.data,
            'description': form.description.data,
            'icon_class': form.icon_class.data,
            'updated_at': datetime.utcnow()
        }
        
        categories_collection.update_one(
            {'_id': ObjectId(category_id)},
            {'$set': update_data}
        )
        
        log_activity('edit_category', 
                    f'Edited category: {form.name.data}',
                    current_user.id)
        
        flash('Category updated successfully!', 'success')
        return redirect(url_for('admin_categories'))
    
    return render_template('admin/category_form.html', form=form, category=category, action='Edit')

@app.route('/admin/category/delete/<category_id>')
@login_required
def delete_category(category_id):
    """Delete category"""
    category = categories_collection.find_one({'_id': ObjectId(category_id)})
    if category:
        # Check if category has products
        product_count = products_collection.count_documents({'category_id': category_id})
        if product_count > 0:
            flash(f'Cannot delete category with {product_count} products. Move or delete products first.', 'error')
        else:
            categories_collection.delete_one({'_id': ObjectId(category_id)})
            log_activity('delete_category', 
                        f'Deleted category: {category["name"]}',
                        current_user.id)
            flash('Category deleted successfully!', 'success')
    else:
        flash('Category not found', 'error')
    
    return redirect(url_for('admin_categories'))

@app.route('/admin/enquiries')
@login_required
def admin_enquiries():
    """View all enquiries"""
    status = request.args.get('status', 'all')
    
    query = {}
    if status != 'all':
        query['status'] = status
    
    enquiries = list(enquiries_collection.find(query).sort('created_at', -1))
    
    # Get product names for enquiries
    for enquiry in enquiries:
        if enquiry.get('product_id'):
            product = products_collection.find_one({'_id': ObjectId(enquiry['product_id'])})
            enquiry['product_name'] = product['name'] if product else 'Product deleted'
    
    return render_template('admin/enquiries.html', 
                         enquiries=enquiries,
                         current_status=status)

@app.route('/admin/enquiry/<enquiry_id>')
@login_required
def view_enquiry(enquiry_id):
    """View single enquiry"""
    enquiry = enquiries_collection.find_one({'_id': ObjectId(enquiry_id)})
    if not enquiry:
        flash('Enquiry not found', 'error')
        return redirect(url_for('admin_enquiries'))
    
    # Get product info if available
    product = None
    if enquiry.get('product_id'):
        product = products_collection.find_one({'_id': ObjectId(enquiry['product_id'])})
    
    return render_template('admin/enquiry_detail.html', 
                         enquiry=enquiry,
                         product=product)

@app.route('/admin/enquiry/update_status/<enquiry_id>/<status>')
@login_required
def update_enquiry_status(enquiry_id, status):
    """Update enquiry status"""
    if status not in ['new', 'contacted', 'quoted', 'closed']:
        flash('Invalid status', 'error')
        return redirect(url_for('view_enquiry', enquiry_id=enquiry_id))
    
    enquiries_collection.update_one(
        {'_id': ObjectId(enquiry_id)},
        {'$set': {'status': status, 'updated_at': datetime.utcnow()}}
    )
    
    log_activity('update_enquiry_status', 
                f'Updated enquiry {enquiry_id} to {status}',
                current_user.id)
    
    flash('Enquiry status updated!', 'success')
    return redirect(url_for('view_enquiry', enquiry_id=enquiry_id))

@app.route('/admin/activities')
@login_required
def admin_activities():
    """View activity logs"""
    activities = list(activity_logs_collection.find()
                     .sort('timestamp', -1)
                     .limit(100))
    return render_template('admin/activities.html', activities=activities)

# ========== API ENDPOINTS ==========
@app.route('/api/stats')
@login_required
def api_stats():
    """API endpoint for stats (AJAX calls)"""
    force = request.args.get('force', 'false').lower() == 'true'
    stats = get_admin_stats(force_refresh=force)
    return jsonify(stats)

@app.route('/admin/refresh-stats')
@login_required
def refresh_stats():
    """Manually refresh stats cache"""
    stats = get_admin_stats(force_refresh=True)
    flash(f'Stats refreshed: {stats["new_enquiries"]} new enquiries', 'info')
    return redirect(request.referrer or url_for('admin_dashboard'))

@app.route('/api/admin/new-enquiries-count')
@login_required
def api_new_enquiries_count():
    """API endpoint for real-time enquiry count updates"""
    count = enquiries_collection.count_documents({'status': 'new'})
    return jsonify({'count': count})

@app.route('/api/products/search')
def api_search_products():
    """API for product search"""
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 10))
    
    if not query:
        return jsonify([])
    
    products = list(products_collection.find(
        {'$text': {'$search': query}},
        {'name': 1, 'part_number': 1, 'manufacturer': 1, 'category_id': 1}
    ).limit(limit))
    
    # Convert ObjectId to string
    for product in products:
        product['_id'] = str(product['_id'])
    
    return jsonify(products)

@app.route('/api/categories')
def api_categories():
    """API for categories"""
    categories = list(categories_collection.find({}, {'name': 1, 'description': 1}))
    for cat in categories:
        cat['_id'] = str(cat['_id'])
        cat['product_count'] = products_collection.count_documents({'category_id': str(cat['_id'])})
    
    return jsonify(categories)

# ========== PERFORMANCE OPTIMIZATION ==========
@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=600'
    return response

# Error Handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f'Server Error: {error}')
    return render_template('errors/500.html'), 500

# Create default admin if not exists
def create_default_admin():
    """Create default admin user if no users exist"""
    if admin_users_collection.count_documents({}) == 0:
        hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
        admin_user = {
            'username': 'admin',
            'email': 'admin@mumbai-tech.com',
            'password': hashed_password,
            'role': 'superadmin',
            'created_at': datetime.utcnow()
        }
        admin_users_collection.insert_one(admin_user)
        print("Default admin created: username='admin', password='admin123'")

# Initialize app
if __name__ == '__main__':
    # Create upload folder if not exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Create default admin
    create_default_admin()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
# routes/admin.py - Premium Admin Routes
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from bson import ObjectId
from datetime import datetime, timedelta
import json

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/admin')

@admin_bp.route('/dashboard')
@login_required
def premium_dashboard():
    """Premium Admin Dashboard"""
    # Get statistics
    stats = {
        'total_products': products_collection.count_documents({}),
        'total_categories': categories_collection.count_documents({}),
        'new_enquiries': enquiries_collection.count_documents({'status': 'new'}),
        'total_enquiries': enquiries_collection.count_documents({}),
        'active_users': 1,  # Placeholder
        'stock_low': products_collection.count_documents({'stock_status': 'limited'})
    }
    
    # Get recent enquiries
    recent_enquiries = list(enquiries_collection.find()
                          .sort('created_at', -1)
                          .limit(5))
    
    # Get recent activities
    recent_activities = list(activity_logs_collection.find()
                           .sort('timestamp', -1)
                           .limit(10))
    
    # Get popular products
    popular_products = list(products_collection.find({'is_featured': 'yes'})
                          .limit(6))
    
    # Get enquiry trends (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    enquiry_trend = []
    for i in range(30):
        day = datetime.utcnow() - timedelta(days=i)
        start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        count = enquiries_collection.count_documents({
            'created_at': {'$gte': start, '$lte': end}
        })
        enquiry_trend.append({
            'date': day.strftime('%Y-%m-%d'),
            'count': count
        })
    
    enquiry_trend.reverse()
    
    return render_template('admin/dashboard.html',
                         stats=stats,
                         recent_enquiries=recent_enquiries,
                         recent_activities=recent_activities,
                         popular_products=popular_products,
                         enquiry_trend=json.dumps(enquiry_trend),
                         current_user=current_user)

# routes/admin.py - Enhanced Product Management
@admin_bp.route('/products')
@login_required
def admin_products():
    """Premium Product Management"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    # Filters
    search = request.args.get('search', '')
    category = request.args.get('category', '')
    stock_status = request.args.get('stock_status', '')
    
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
    
    # Get total count for pagination
    total = products_collection.count_documents(query)
    total_pages = (total + per_page - 1) // per_page
    
    # Get products
    products = list(products_collection.find(query)
                   .sort('created_at', -1)
                   .skip((page - 1) * per_page)
                   .limit(per_page))
    
    # Get categories for dropdown
    categories = list(categories_collection.find().sort('name', 1))
    
    return render_template('admin/products.html',
                         products=products,
                         categories=categories,
                         current_page=page,
                         total_pages=total_pages,
                         search=search,
                         selected_category=category,
                         selected_stock=stock_status)
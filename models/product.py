# models/product.py - Enhanced Product Schema
from datetime import datetime
from bson import ObjectId

class Product:
    @staticmethod
    def get_schema():
        return {
            'name': {
                'type': 'string',
                'required': True,
                'minlength': 3,
                'maxlength': 200
            },
            'description': {
                'type': 'string',
                'required': True,
                'minlength': 10
            },
            'short_description': {
                'type': 'string',
                'maxlength': 200
            },
            'category_id': {
                'type': 'string',
                'required': True
            },
            'part_number': {
                'type': 'string',
                'required': True,
                'minlength': 3,
                'maxlength': 100
            },
            'manufacturer': {
                'type': 'string',
                'required': True,
                'minlength': 2,
                'maxlength': 100
            },
            'brand': {
                'type': 'string',
                'maxlength': 100
            },
            'machine_type': {
                'type': 'string',
                'maxlength': 200
            },
            'technical_specs': {
                'type': 'string'
            },
            'price': {
                'type': 'float',
                'min': 0
            },
            'currency': {
                'type': 'string',
                'default': 'INR'
            },
            'stock_status': {
                'type': 'string',
                'allowed': ['in_stock', 'limited', 'out_of_stock', 'available_soon'],
                'default': 'in_stock'
            },
            'stock_quantity': {
                'type': 'integer',
                'min': 0
            },
            'is_featured': {
                'type': 'string',
                'allowed': ['yes', 'no'],
                'default': 'no'
            },
            'is_active': {
                'type': 'string',
                'allowed': ['active', 'inactive'],
                'default': 'active'
            },
            'images': {
                'type': 'list',
                'default': []
            },
            'spec_documents': {
                'type': 'list',
                'default': []
            },
            'meta_title': {
                'type': 'string',
                'maxlength': 200
            },
            'meta_description': {
                'type': 'string',
                'maxlength': 300
            },
            'meta_keywords': {
                'type': 'list',
                'default': []
            },
            'view_count': {
                'type': 'integer',
                'default': 0
            },
            'enquiry_count': {
                'type': 'integer',
                'default': 0
            },
            'created_at': {
                'type': 'datetime',
                'default': datetime.utcnow
            },
            'updated_at': {
                'type': 'datetime',
                'default': datetime.utcnow
            },
            'created_by': {
                'type': 'string'
            },
            'last_updated_by': {
                'type': 'string'
            }
        }
SECRET_KEY = 'this is a not very secret key'

SITE_URL = 'http://localhost:8000'
SITE_ROOT = '/tmp/wbc/site_root'
STATIC_ROOT = '/tmp/wbc/static_root'
MEDIA_ROOT = '/tmp/wbc/media'

SITE_ID = 1

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'wbc',
        'USER': 'postgres'
    }
}

HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.elasticsearch_backend.ElasticsearchSearchEngine',
        'URL': 'http://127.0.0.1:9200/',
        'INDEX_NAME': 'haystack',
    },
}
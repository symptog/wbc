# -*- coding: utf-8 -*-
from django.test import TestCase
from django.test import Client

from django.core.urlresolvers import reverse

from wbc.projects.models import Project
from wbc.region.models import District
from wbc.region.models import Muncipality

from .models import Comment

class CommentTestCase(TestCase):

    def setUp(self):

        Muncipality(name='Berlin').save()

        district = District(
            name='Mitte',
            muncipality=Muncipality.objects.get(name='Berlin')
        )
        district.save()

        project = Project(
            address='Unter den Linden 1',
            description='Brandenburger Tor',
            lat='-13',
            lon='52',
            identifier='A',
            active=False,
        )
        project.save()
        project.entities.add(district)
        project.save()
        self.project_id = project.pk

    def create_comment(self, author_name='test_author', author_email='author@test.de', author_url='http://google.com', enabled=True, content='content'):
        project = Project.objects.get(address='Unter den Linden 1')
        return Comment.objects.create(
            project=project,
            author_name=author_name,
            author_email=author_email,
            author_url=author_url,
            enabled=enabled)

    def test_comment(self):
        from six.moves.urllib_parse import urlencode
        import hashlib
        c = self.create_comment()
        self.assertTrue(isinstance(c, Comment))
        self.assertEqual(
            c.__str__(), str(c.project) + ', ' + c.author_name)
        gravatar_url = "http://www.gravatar.com/avatar/" + \
            hashlib.md5(c.author_email.lower()).hexdigest() + "?"
        gravatar_url += urlencode({'s': str(32)})
        self.assertEqual(c.gravatar, gravatar_url)

    def test_view_Project_post_comment(self):
        url = reverse('project', args=[self.project_id])

        comment = {
            'author_name': 'Thomas Testuser',
            'author_email': 'test@example.com',
            'author_email1': '',
            'author_url': 'example.com',
            'content': 'Test'
        }

        response = Client().post(url, comment)
        self.assertEqual(response.status_code, 200)

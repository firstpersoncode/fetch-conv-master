# Import the database object (db) from the main application module
# We will define this inside /app/__init__.py in the next sections.
# import pymongo
import datetime
from app import db

class User:
    def __init__(self, collection):
        self.collection = db[collection]
        # self.unique = self.collection.create_index([('email', pymongo.ASCENDING)], unique=True)
        # sorted(list(self.collection.index_information()))

    def addUser(self, email, password):
        user = {
            'email': email,
            'password': password,
            'ct': datetime.datetime.utcnow()
        }

        self.collection.insert_one(user)

    def queryUser(self, opt):
        return self.collection.find_one(opt)

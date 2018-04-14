# Import the database object (db) from the main application module
# We will define this inside /app/__init__.py in the next sections.
import pymongo
import datetime
from app import db

class Channel:
    def __init__(self, collection):
        self.collection = db[collection]
        # self.unique = self.collection.create_index([('id', pymongo.ASCENDING)], unique=True)
        # self.uniqueC = self.collection.create_index([('ch', pymongo.ASCENDING)], unique=True)
        # sorted(list(self.collection.index_information()))

    def addChannel(self, data):
        self.collection.insert_one(data)

    def addInfo(self, c_id, info):
        self.collection.find_one_and_update({'id': c_id}, {
            '$set': { 'info': info }
        })

    def addMessages(self, c_id, data):
        self.collection.find_one_and_update({'id': c_id}, {
            '$addToSet': { 'histories': { '$each': data } }
        })

    def getChannel(self, c_id):
        return self.collection.find_one({'id': c_id})

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
        self.collection.find_one_and_update({
            'id': data['id']
        }, {
          '$set': {
            'detail': data,
            'updated': datetime.datetime.utcnow()
          }
        }, upsert=True, new=True)

    # def addInfo(self, data):
    #     self.collection.find_one_and_update({'id': c_id}, {
    #         '$set': { 'info': info }
    #     })

    def addMessages(self, c_id, data):
        self.collection.find_one_and_update({
            'id': c_id
        }, {
            '$addToSet': {
                'messages': { '$each': data }
            }
        }, upsert=True, new=True)

    def addPins(self, c_id, data):
        self.collection.find_one_and_update({
            'id': c_id
        }, {
            '$addToSet': {
                'pins': { '$each': data }
            }
        }, upsert=True, new=True)

    # def getChannel(self, c_id):
    #     return self.collection.find_one({'id': c_id})

'use strict';

const fetch = require('node-fetch'),
      express = require('express'),
      graphqlHTTP = require('express-graphql'),
      {
        GraphQLObjectType,
        GraphQLInterfaceType,
        GraphQLList,
        GraphQLString,
        GraphQLInt,
        GraphQLID,
        GraphQLSchema
      } = require('graphql')

const cache = {
  item: {},
  user: {}
}

const API = 'https://hacker-news.firebaseio.com/v0'
function getItem(id) {
  if (!cache.item[id])
    cache.item[id] = fetch(`${API}/item/${id}.json`).then(res => res.json())
  return cache.item[id]
}
function getUser(id) {
  if (!cache.user[id])
    cache.user[id] = fetch(`${API}/user/${id}.json`).then(res => res.json())
  return cache.user[id]
}

// Define the User type
const User = new GraphQLObjectType({
  name: 'User',
  fields: function() { return {
    id: { type: GraphQLString },
    created: { type: GraphQLInt },
    karma: { type: GraphQLInt },
    about: { type: GraphQLString },
    delay: { type: GraphQLInt },
    submitted: { type: new GraphQLList(Item)	},
    raw: {
      type: GraphQLString,
      resolve: (o) => JSON.stringify(o)
    }
  }}
});

// Define the Item type
const Item = new GraphQLObjectType({
  name: 'Item',
  fields: function() { return {
    id: { type: GraphQLID },
    time: { type: GraphQLInt },
    score: { type: GraphQLInt },
    type: { type: GraphQLString },
    title: { type: GraphQLString },
    url: { type: GraphQLString },
    text: { type: GraphQLString },
    delay: { type: GraphQLInt },
    kids: {
      type: new GraphQLList(Item),
      resolve: ({kids}) => Promise.all(kids.map(getItem))
    },
    parent: {
      type: Item,
      resolve: ({parent}) => getItem(parent)
    },
    by: {
      type: User,
      resolve: ({by}) => getUser(by)
    },
    raw: {
      type: GraphQLString,
      resolve: (o) => JSON.stringify(o)
    }
  }}
}); 

// Define the Query type
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: User,
      // `args` describes the arguments that the `user` query accepts
      args: {
        id: {
          type: GraphQLString
        }
      },
      resolve: (_, {id}) => getUser(id)
    },
    item: {
      type: Item,
      args: {
        id: { type: GraphQLID }
      },
      resolve: (_, {id}) => getItem(id)
    }
  }
});


var schema = new GraphQLSchema({query: queryType});

var app = express();
app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));
app.listen(4000);

console.log('Running a GraphQL API server at localhost:4000/graphql');

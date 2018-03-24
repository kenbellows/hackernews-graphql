'use strict';

// based on http://graphql.org/graphql-js/constructing-types/

const express = require('express'),
      graphqlHTTP = require('express-graphql'),
      {
        GraphQLObjectType,
        GraphQLString,
        GraphQLSchema
      } = require('graphql');

// Maps id to User object
const fakeDatabase = {
  'a': {
    id: 'a',
    name: 'alice',
  },
  'b': {
    id: 'b',
    name: 'bob',
  }
};


// Define the User type
const userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },
    summary: {
      type: GraphQLString,
      resolve: ({id, name}) => `(${id}) ${name}`
    },
    json: {
      type: GraphQLString,
      resolve: (o) => JSON.stringify(o)
    }
  }
}); 

// Define the Query type
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: userType,
      // `args` describes the arguments that the `user` query accepts
      args: {
        id: {
          type: GraphQLString
        }
      },
      resolve: (_, {id}) => fakeDatabase[id]
    }
  }
});


var schema = new GraphQLSchema({query: queryType});

var app = express();
app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));
app.listen(4000);

console.log('Running a GraphQL API server at localhost:4000/graphql');

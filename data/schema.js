/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  // Import methods that your schema can use to interact with your database
  Author,
  Book,
  getAuthor,
  getAuthors,
  getViewer,
  getBook,
  getBooks,
} from './database';

/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */
var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'Author') {
      return getAuthor(id);
    } else if (type === 'Book') {
      return getBook(id);
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof Author) {
      return authorType;
    } else if (obj instanceof Book)  {
      return bookType;
    } else {
      return null;
    }
  }
);

/**
 * Define your own types here
 */

var photographedInterface = new GraphQLInterfaceType({
  name: 'Photographed',
  description: 'An interface type for things that have been photographed',
  fields: () => ({
    photoUrl: {
      type: GraphQLString,
      description: 'The url of the photograph'
    }
  }),
  resolveType: (data) => {
    if (obj instanceof Author) {
      return authorType;
    } else if (obj instanceof Book)  {
      return bookType;
    } else {
      return null;
    }
  }
});

var authorType = new GraphQLObjectType({
  name: 'Author',
  description: 'A person who writes books',
  fields: () => ({
    id: globalIdField('Author'),
    name: {
      type: GraphQLString,
      description: 'What should we call you?'
    },
    books: {
      type: bookConnection,
      description: 'An author\'s collection of books',
      args: connectionArgs,
      resolve: (_, args) => connectionFromArray(getBooks(), args),
    },
    photoUrl: {
      type: GraphQLString
    }
  }),
  interfaces: [nodeInterface, photographedInterface],
});

var bookType = new GraphQLObjectType({
  name: 'Book',
  description: 'A super-readable book',
  fields: () => ({
    id: globalIdField('Book'),
    title: {
      type: GraphQLString,
      description: 'The name of the book',
    },
    author: {
      type: authorType,
      description: 'The great mind that penned this staggering work.',
      resolve: book => getAuthor(book.author)
    },
    photoUrl: {
      type: GraphQLString
    }
  }),
  interfaces: [nodeInterface, photographedInterface],
});

/**
 * Define your own connection types here
 */
var {connectionType: bookConnection} =
  connectionDefinitions({name: 'Book', nodeType: bookType});
var {connectionType: authorConnection} =
  connectionDefinitions({name: 'Author', nodeType: authorType});

/**
 * This is the type that will be the root of our query,
 * and the entry point into our schema.
 */
var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    // Add your own root fields here
    viewer: {
      type: authorType,
      resolve: () => getViewer(),
    },
    authors: {
      type: authorConnection,
      args: connectionArgs,
      description: 'All of the authors that exist',
      resolve: (_, args) => connectionFromArray(getAuthors(), args)
    }
  }),
});

/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 */
var mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    // Add your own mutations here
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export var Schema = new GraphQLSchema({
  query: queryType,
  // Uncomment the following after adding some mutation fields:
  // mutation: mutationType
});

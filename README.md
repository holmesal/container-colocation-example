# What is this?

This is a guided tour of a demo project, designed to address a couple of graphql+relay+react concepts that could be improved in your current implementation.

Here are the things I want to demonstrate:

* Connecting things in the type system
* Colocating (small) relay containers with react components
* Using interfaces/unions in the type system to handle shared fields/properties
* Using interfaces/unions in Relay to build general-purpose containers+components
* Using connections in the schema

To keep things simple, I'm just going to use a simple 2-type schema to demonstrate these concepts - imagine we're building the original Amazon (remember when it was a bookstore?) - so we've got `Author`s writes `Book`s.

Let's dive in.

## Connecting things in the type system

There are two ways to connect two types together, and it depends on whether the relationship is one-to-one or one-to-many.

For one-to-one relationships, you can just specify the type you want to connect to when defining the field on the type you're connecting from. For example, our `Book` type has an *author* field that only ever points to a single `Author` type (we're not handling ghostwriters):

```javascript
var bookType = new GraphQLObjectType({
  ...
  fields: () => ({
    ...
    author: {
      type: authorType,
      description: 'The great mind that penned this staggering work.',
      resolve: book => getAuthor(book.author)
    },
    ...
  }),
  ...
});
```

If you open up GraphiQL, you'll see that this works as expected:
![](https://cloud.githubusercontent.com/assets/1147390/17792490/d10deffc-6555-11e6-952d-c19b8eee8490.png)

*Note that we can query this `Book` node directly via it's graphql id, because the `Book` graphql type implements the `nodeInterface`*

Easy enough. 

One-to-many relationships are pretty straightforward as well - with one caveat. If you're using Relay, you need to use `Connection`s.

*Note that connections are a relay concept, not a graphql concept - in vanilla GraphQL you can just use `new GraphQLListType(yourTypeHere)` - but you'd need to implement your own pagination, etc.*

We'll work with the `Author -> [Book, Book, Book]` connection. The first step is to create the connectionType:
```javascript
var {connectionType: bookConnection} =
  connectionDefinitions({name: 'Book', nodeType: bookType});
```

The result of this is a `bookConnection` type that you can use to specify a connection from your `Author` type:

```javascript
var authorType = new GraphQLObjectType({
  ...
  fields: () => ({
    ...
    books: {
      type: bookConnection,
      description: 'An author\'s collection of books',
      args: connectionArgs,
      resolve: (author, args) => connectionFromArray(getBooksByAuthor(author.id), args)
    },
    ...
  }),
  ...
});
```

Notice that we're using the `bookConnection` type we created earlier, as well as the default relay connection args (`connectionArgs`). You can add additional arguments here if you need to.

The `resolve()` method here is also really important. Given an `Author` object (whatever was returned by calling `getAuthor(id)` above), `resolve()` is responsible for returning a valid relay connection. In our example, our fake database returns an array of `Book` objects, so we can just wrap that result in relay's `connectionFromArray()` method. Each `Book` returned by the database will be cast to the graphql `Book` type.

Pop open graphql again and you can start querying this connection:

![image](https://cloud.githubusercontent.com/assets/1147390/17793113/e236ba94-6559-11e6-8b11-b93b428f193b.png)

*Note: to keep things simple, the `Viewer` is an `Author`. You could also query an `Author` node by id at the top level of the query.*




## Schema

We're going to build a simple blog schema, where an 

## Using connections in the schema

### Connecting one type to another type





## Installation

```
npm install
```

## Running

Start a local server:

```
npm start
```

## Developing

Any changes you make to files in the `js/` directory will cause the server to
automatically rebuild the app and refresh your browser.

If at any time you make changes to `data/schema.js`, stop the server,
regenerate `data/schema.json`, and restart the server:

```
npm run update-schema
npm start
```

## License

Relay Starter Kit is [BSD licensed](./LICENSE). We also provide an additional [patent grant](./PATENTS).

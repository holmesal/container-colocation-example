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

```
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

If you open up GraphiQL, you'll see that this works:



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

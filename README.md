# What is this?

This is a guided tour of a demo project, designed to address a couple of graphql+relay+react concepts that could be improved in your current implementation.

Here are the things I want to demonstrate:

* Connecting things in the type system
* Colocating (small) relay containers with react components
* Using interfaces/unions in the type system to handle shared fields/properties
* Using interfaces/unions in Relay to build general-purpose containers+components

To keep things simple, I'm just going to use a simple 2-type schema to demonstrate these concepts - imagine we're building the original Amazon (remember when it was a bookstore?) - so we've got `Author`s that write `Book`s.

Also, here are some of the more important files:

* [GraphQL schema](/data/schema.js)
* [Simple fake "database"](/data/database.js)
* [Root component (List of `Book`s)](/js/components/App.js)
* [`Book` component](/js/components/Book.js)
* [`Author` component](/js/components/Author.js)
* [`Photo` component (demonstrates using interfaces)](/js/components/Photo.js)

Let's dive in.

## Getting started

This will be a lot more fun if you play around with the schema while going through this writeup. Here's how to get up and running:

```
npm install
npm start
```

Open up the graphiQL interface by going to http://localhost:8080. If you haven't used GraphiQL before, it's amazing. You can type graphql queries on the left and press play, and see the results on the right. It also autocompletes your schema, and you can browse your entire schema by hitting `< Docs` in the upper-right.

# Connecting things in the type system

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

You can also pass some parameters to connections ([more info](https://facebook.github.io/relay/docs/graphql-connections.html#content): 
```
books(first: 1) {
  ...
}
```

That's it for connections. Pretty straightforward.





# Colocating (small) relay containers with react components

A good rule to follow:

**If a react component requires a piece of relay data, that should be specified in the same file as the react component**

In addition, a given component shouldn't try to predict what kind of data it's child components will need - instead, it should let those child components specify those data dependencies and use `getFragment()` to assemble them.

For example, here's a simple `<Book>` component:

``` javascript
import React from 'react';
import Relay from 'react-relay';
import Author from './Author';

class Book extends React.Component {
  render() {
    return (
      <div>
        <strong>{this.props.book.title}</strong> (ID: {this.props.book.id})
        <Author author={this.props.book.author} />
        <hr/>
      </div>
    );
  }
}

export default Relay.createContainer(Book, {
  fragments: {
    book: () => Relay.QL`
      fragment on Book {
        id,
        title,
        author {
          ${Author.getFragment('author')}
        }
      }
    `,
  },
});
```

Things to note: 

* Only the things that this component explicitly needs are present in the graphql fragment at the bottom: the id and title of the book.
* The `<Author>` component is allowed to specify it's own data dependencies, which are included here via the `getFragment()` call.

Now let's take a look at the `<Author>` component:

``` javascript
import React from 'react';
import Relay from 'react-relay';

class Author extends React.Component {
  render() {
    return (
      <div>
        - by <strong>{this.props.author.name}</strong>
      </div>
    );
  }
}

export default Relay.createContainer(Author, {
  fragments: {
    author: () => Relay.QL`
      fragment on Author {
        name
      }
    `,
  },
});
```

This `<Author>` component depends on the `name` field, so it specifies it in it's container. This fragment gets pulled up into the parent `<Book>` component at request-time.

A very interesting (and awesome IMO) relay feature is that even if the parent (in this case, `<Book>`) has a fragment that contains the `name` field, if `<Author>` does not specify the `name` field in it's own fragment, it **will not be present on `this.props.author`*. This is really great - it encourages you not to rely on implicit dependencies specified in the parent and instead encourages you to be as explicit as possible.





# Using interfaces/unions

Back to the server for a second.

`Book`s have photos. `Author`s have photos. It's tempting to build a react component that can render a photo, whether it comes from an `Author` or a `Book`.

The fragment for such a component would look something like this:

```
fragment on AuthorOrBook {
  photoUrl
}
```

Of course, this doesn't actually work because there is no `AuthorOrBook` type - and we need to fragment on a type here. So what we can do is create an `Interface` that contains the properties shared between the `Author` and `Book` types - in this case, just the `photoUrl`.

We'll call this the `Photographed` interface type (because names are heard amirite), and we'll specify it in our GraphQL schema like so:

``` javascript
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
```

We can then add this interface type to anything that we want to implement it - in this case, our `Author` and `Book` types:

``` javascript
var authorType = new GraphQLObjectType({
  ...
  interfaces: [nodeInterface, photographedInterface],
});

...

var bookType = new GraphQLObjectType({
  ...
  interfaces: [nodeInterface, photographedInterface],
});
```

If you open (and refresh) graphiql, you'll notice that you can now do this:
![image](https://cloud.githubusercontent.com/assets/1147390/17793649/cbe1bbf0-655d-11e6-9e2e-86d571af577b.png)

Notice that you can now treat the `Photographed` interface type like any other type - although it'll only give you access to the properties in that interface (so only `photoUrl` in our example). If you want to access properties from, say, the `Book` type - you'll have to fragment on that separately. You can, however, access the `photoUrl` field on the `Book` type without fragmenting on the `Photographed` interface type.

This is the missing piece we need to build our general-purpose `<Photo>` component - the fragment in that component now uses our shiny new `Photographed` interface type and looks like:

```
fragment on Photographed {
  photoUrl
}
```

The full component looks like this:

``` javascript
import React, {PropTypes} from 'react';
import Relay from 'react-relay';

class Photo extends React.Component {
  render() {
    <img src={this.props.photographed.photoUrl} />;
  }
}

export default Relay.createContainer(Photo, {
  fragments: {
    photographed: () => Relay.QL`
      fragment on Photographed {
        photoUrl
      }
    `,
  },
});

```

You can pass this component a `photographed` property with anything that implements the `Photographed` interface type, and it'll grab the `photoUrl` field and render itself.

Here's how you would use this component from `<Author>`:

``` javascript
...
import Photo from './Photo';

class Author extends React.Component {
  render() {
    return (
      ...
        <Photo photographed={this.props.author} />
      ...
    );
  }
}

export default Relay.createContainer(Author, {
  fragments: {
    author: () => Relay.QL`
      fragment on Author {
        ...
        ${Photo.getFragment('photographed')}
      }
    `,
  },
});

```

And here's how you would use this component from `<Book>`:

``` javascript
...
import Photo from './Photo';

class Book extends React.Component {
  render() {
    return (
      ...
        <Photo photographed={this.props.book} />
      ...
    );
  }
}

export default Relay.createContainer(Book, {
  fragments: {
    book: () => Relay.QL`
      fragment on Book {
        ...
        ${Photo.getFragment('photographed')}
      }
    `,
  },
});

```

Cool!



## (Developing)

Any changes you make to files in the `js/` directory will cause the server to
automatically rebuild the app and refresh your browser.

If at any time you make changes to `data/schema.js`, stop the server,
regenerate `data/schema.json`, and restart the server:

```
npm run update-schema
npm start
```

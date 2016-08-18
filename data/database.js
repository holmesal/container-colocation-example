/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

  import _ from 'lodash';

// Model types
class Author {}
class Book {}

// Mock data
var authors = [];
var viewer = new Author();
viewer.id = 'a1';
viewer.name = 'Raoul Duke';
viewer.photoUrl = 'http://www.leftways.com/wp-content/uploads/2014/06/hunter-thompson-our-kitchen-sink.jpg';
authors.push(viewer);

var hem = new Author();
hem.id = 'a2';
hem.name = 'Hrnest Zemingway';
hem.photoUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/28/ErnestHemingway.jpg';
authors.push(hem);

var books = [];
var book1 = new Book();
book1.id = 'b1';
book1.title = 'An excellent first book';
book1.photoUrl = 'https://s-media-cache-ak0.pinimg.com/236x/31/03/a7/3103a7cb7d4f60b7985a444989e8af89.jpg';
books.push(book1);

var book2 = new Book();
book2.id = 'b2';
book2.title = 'A much-awaited sequel';
book2.photoUrl = 'https://lh3.googleusercontent.com/4p6WupYGMo2OaF3Xld6MAYXJfxT0U_SvMQy4UHs7HQVvec5cm-dfp-zXPiBMvEwkoT6ZIeV1rk92r_7h85lWGhBNdvgXMg=s700';
books.push(book2);

var book3 = new Book();
book3.id = 'b3';
book3.title = 'A Hello to Arms';
book3.photoUrl = 'https://images-na.ssl-images-amazon.com/images/I/51GxAgnDqVL._SX326_BO1,204,203,200_.jpg';
books.push(book3);

// Associate books <-> author
book1.author = viewer.id;
book2.author = viewer.id;
book3.author = hem.id;
viewer.books = _.map(books, 'id');

module.exports = {
  // Export methods that your schema can use to interact with your database
  getAuthor: (id) => authors.find(a => a.id === id),
  getAuthors: () => authors,
  getViewer: () => viewer,
  getBook: (id) => books.find(b => b.id === id),
  getAllBooks: () => books,
  getBooksByAuthor: (id) => _.filter(books, {author: id}),
  Author,
  Book,
};

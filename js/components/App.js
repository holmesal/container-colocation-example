import React from 'react';
import Relay from 'react-relay';
import Book from './book';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Books</h1>
        <ul>
          {this.props.viewer.books.edges.map(edge =>
            <Book book={edge.node} key={edge.node.id} />
          )}
        </ul>
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Author {
        books(first: 10) {
          edges {
            node {
              id,
              ${Book.getFragment('book')}
            },
          },
        },
      }
    `,
  },
});

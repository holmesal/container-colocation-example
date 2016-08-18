import React from 'react';
import Relay from 'react-relay';
import Author from './Author';
import Photo from './Photo';

class Book extends React.Component {
  render() {
    return (
      <div>
        <Photo photographed={this.props.book} />
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
        ${Photo.getFragment('photographed')}
      }
    `,
  },
});

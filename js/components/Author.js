import React from 'react';
import Relay from 'react-relay';
import Photo from './Photo';

class Author extends React.Component {
  render() {
    return (
      <div style={styles.wrapper}>
        <Photo photographed={this.props.author} rounded />
        - by <strong>{this.props.author.name}</strong>
      </div>
    );
  }
}

const styles = {
  wrapper: {
    paddingLeft: 80
  }
}

export default Relay.createContainer(Author, {
  fragments: {
    author: () => Relay.QL`
      fragment on Author {
        name
        ${Photo.getFragment('photographed')}
      }
    `,
  },
});

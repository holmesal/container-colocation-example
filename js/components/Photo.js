import React, {PropTypes} from 'react';
import Relay from 'react-relay';
import Author from './Author';
import _ from 'lodash';

class Photo extends React.Component {

  static propTypes = {
    rounded: PropTypes.bool
  };

  static defaultProps = {
    rounded: false
  };

  render() {
    return this.props.rounded ?
      <div style={_.assign(styles.small, {backgroundImage: `url(${this.props.photographed.photoUrl})`})}></div> :
      <img src={this.props.photographed.photoUrl} style={styles.big} />;
  }
}

const styles = {
  small: {
    width: 40,
    height: 40,
    backgroundSize: 'cover',
    backgroundColor: '#FAFAFA',
    backgroundPosition: 'center center',
    borderRadius: 20
  },
  big: {
    width: 60
  }
};

export default Relay.createContainer(Photo, {
  fragments: {
    photographed: () => Relay.QL`
      fragment on Photographed {
        photoUrl
      }
    `,
  },
});

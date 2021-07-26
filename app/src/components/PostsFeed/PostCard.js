import React from 'react';
import {Alert, Button, StyleSheet, TouchableOpacity, View} from 'react-native';
import api from '../../constants/api';
import {gs} from '../../constants/styles';
import {date_to_string} from '../../utils';
import {Avatar} from '../Avatar';
import TextC from '../TextC';
import FavoriteBorder from '../../../assets/favorite_border.svg';
import FavoriteFilled from '../../../assets/favorite_filled.svg';
import MoreDots from '../../../assets/three_dots.svg';
import Forum from '../../../assets/forum.svg';
import axios from 'axios';
import Menu, {MenuItem} from 'react-native-material-menu';
import {AuthContext} from '../../context/AuthProvider';
import {useNavigation} from '@react-navigation/native';
import {PostsContext} from '../../context/PostsProvider';
// import {Button} from '../Button';

const PostCard = ({post, onDelete, shouldReload}) => {
  const {
    _id,
    isLiked,
    likesCount,
    dateCreated,
    content,
    author,
    commentsCount,
    isAuthor,
  } = post;

  const [liked, setLiked] = React.useState(isLiked);
  const [likes, setLikes] = React.useState(likesCount);

  console.log('duuuuh', author);

  const menuRef = React.useRef();
  const navigation = useNavigation();
  const postsContext = React.useContext(PostsContext);
  const authContext = React.useContext(AuthContext);
  const {is_admin} = authContext.user;

  React.useEffect(() => {
    setLiked(isLiked);
    setLikes(likesCount);
  }, [isLiked, likesCount, commentsCount]);

  const onLike = async () => {
    try {
      const res = await axios.post(api.post_like, {id: _id});
      if (res.status === 200) {
        if (shouldReload) {
          postsContext.likePost(_id);
        } else {
          setLikes(l => (liked ? l - 1 : l + 1));
          setLiked(l => !l);
        }
      }
    } catch (err) {
      Alert.alert('', 'Il y a eu une erreur');
    }
  };

  const onMoreOpen = () => {
    menuRef.current.show();
  };

  const goToPMs = () => {};

  const onPostPress = () => {
    navigation.navigate('Comments', {post: post});
  };
  const editPost = () => {};
  const deletePost = () => {
    Alert.alert('', 'Êtes-vous sûr de vouloir supprimer cette publication ?', [
      {
        text: 'Oui',
        onPress: async () => {
          try {
            await axios.post(api.post_delete, {id: _id});
            onDelete(_id);
          } catch (err) {
            console.log(err);
            Alert.alert('', 'Il y a eu une erreur');
          }
        },
      },
      {text: 'Non', style: 'cancel'},
    ]);
  };

  const FavoriteIcon = liked ? FavoriteFilled : FavoriteBorder;

  return (
    <TouchableOpacity style={styles.container} onPress={onPostPress}>
      <View style={styles.titleContainer}>
        <Avatar uri={author.avatar_uri} remote size={45} />
        <View style={styles.title}>
          <TextC style={[gs.title, styles.username]}>{author.username}</TextC>
          <TextC style={gs.subtitle}>
            Publié le {date_to_string(dateCreated)}
          </TextC>
        </View>
        {/* <TouchableOpacity onPress={onMoreOpen}> */}
        <Menu ref={menuRef} button={<MoreDots onPress={onMoreOpen} />}>
          {(isAuthor || is_admin) && (
            <>
              <MenuItem onPress={editPost}>Modifier</MenuItem>
              <MenuItem onPress={deletePost}>Supprimer</MenuItem>
            </>
          )}

          {!isAuthor && <MenuItem onPress={goToPMs}>Message Privé</MenuItem>}
        </Menu>
        {/* <MoreDots /> */}
        {/* </TouchableOpacity> */}
      </View>
      <TextC>{content}</TextC>
      <View style={styles.footer}>
        <TouchableOpacity style={gs.flex_direction_row}>
          <Forum fill={gs.colors.primary} height={20} width={20} />
          <TextC style={[styles.actionButton]}>{commentsCount}</TextC>
        </TouchableOpacity>
        <TouchableOpacity
          style={[gs.flex_direction_row, styles.title]}
          onPress={onLike}>
          <FavoriteIcon fill={gs.colors.primary} height={20} width={20} />
          <TextC style={[styles.actionButton]}>{likes}</TextC>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
    padding: gs.paddings.small / 2,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    // marginTop: 0,
    // borderColor: 'black',
    elevation: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
  },
  title: {
    marginLeft: 15,
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButton: {
    marginLeft: 5,
    color: gs.colors.primary,
    fontWeight: 'bold',
  },
});

export default PostCard;

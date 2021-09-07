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
import {MediaTypeOptions} from 'expo-image-picker';
import MediaRender from '../MediaRender';
import Poll from '../Poll';
// import {Button} from '../Button';

const PostCard = ({post, onDelete, shouldReload, screen}) => {
  const {
    _id,
    isLiked,
    likesCount,
    dateCreated,
    content,
    author,
    commentsCount,
    isAuthor,
    medias,
    poll,
    pollHasVoted,
  } = post;

  const [liked, setLiked] = React.useState(isLiked);
  const [likes, setLikes] = React.useState(likesCount);

  const menuRef = React.useRef();
  const navigation = useNavigation();
  const postsContext = React.useContext(PostsContext);
  const authContext = React.useContext(AuthContext);
  const {is_admin} = authContext.user;

  // rename type field to mediaType
  const mediasParsed = medias
    ? medias.map(media => ({...media, mediaType: media.type}))
    : [];

  React.useEffect(() => {
    setLiked(isLiked);
    setLikes(likesCount);
  }, [isLiked, likesCount, commentsCount]);

  const onLike = async () => {
    try {
      const res = await axios.post(api.post_like, {id: _id});
      if (res.status === 200) {
        setLikes(l => (liked ? l - 1 : l + 1));
        setLiked(l => !l);
        postsContext.likePost(screen, _id, shouldReload);
      }
    } catch (err) {
      console.log(err);
      Alert.alert('', 'Il y a eu une erreur');
    }
  };

  const onPollVote = option => async () => {
    try {
      const res = await axios.post(api.post_poll_vote, {
        post_id: _id,
        option,
      });
      if (res.status === 200) {
        postsContext.updatePoll(screen, _id, res.data);
      }
    } catch (err) {
      Alert.alert('', 'Il y a eu une erreur');
    }
  };

  const onMoreOpen = () => {
    menuRef.current.show();
  };

  const goToPMs = () => {
    navigation.navigate('ConversationScreen', {withUser: author});
  };

  const onPostPress = () => {
    navigation.navigate('Comments', {post, screen});
  };
  const editPost = () => {};
  const deletePost = () => {
    Alert.alert('', 'Êtes-vous sûr de vouloir supprimer cette publication ?', [
      {
        text: 'Oui',
        onPress: async () => {
          try {
            await axios.post(api.post_delete, {id: _id});
            postsContext.deletePost(screen, _id);
          } catch (err) {
            console.log(err);
            Alert.alert('', 'Il y a eu une erreur');
          }
        },
      },
      {text: 'Non', style: 'cancel'},
    ]);
  };

  const banUser = async () => {
    Alert.alert(
      '',
      'Êtes-vous sûr de vouloir bannir cet utilisateur ? Cette action est irréversible.',
      [
        {
          text: 'Oui',
          onPress: async () => {
            try {
              await axios.post(api.user_ban, {user_id: author._id});
              postsContext.deletePost(screen, _id);

              Alert.alert(
                '',
                "L'utilisateur a bien été banni. Ses publications disparaîtront en raffraîchissant la page.",
              );
            } catch (err) {
              console.log(err);
              Alert.alert('', 'Il y a eu une erreur');
            }
          },
        },
        {text: 'Non', style: 'cancel'},
      ],
    );
  };

  const FavoriteIcon = liked ? FavoriteFilled : FavoriteBorder;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Avatar uri={author.avatar_uri} remote size={45} />
        <View style={styles.title}>
          <TextC style={[gs.title, styles.username]}>
            {author.username.substring(0, 22)}
            {author.username.length > 22 && '...'}
          </TextC>
          <TextC style={gs.subtitle}>
            Publié le {date_to_string(dateCreated)}
          </TextC>
        </View>
        {/* <TouchableOpacity onPress={onMoreOpen}> */}
        <Menu ref={menuRef} button={<MoreDots onPress={onMoreOpen} />}>
          {(isAuthor || is_admin) && (
            <>
              {/* <MenuItem onPress={editPost}>Modifier</MenuItem> */}
              <MenuItem onPress={deletePost}>Supprimer</MenuItem>
            </>
          )}
          {is_admin && <MenuItem onPress={banUser}>Bannir</MenuItem>}

          {!isAuthor && <MenuItem onPress={goToPMs}>Message Privé</MenuItem>}
        </Menu>
        {/* <MoreDots /> */}
        {/* </TouchableOpacity> */}
      </View>
      <TextC>{content}</TextC>
      {mediasParsed.length > 0 && (
        <MediaRender medias={mediasParsed} style={styles.mediaContent} />
      )}
      {poll && Object.keys(poll).length > 0 && (
        <Poll
          {...poll}
          style={{marginTop: 20}}
          canVote={!poll.userAnswer && !isAuthor}
          showResults={poll.userAnswer || isAuthor}
          onVote={onPollVote}
        />
      )}
      <View style={styles.footer}>
        <TouchableOpacity style={gs.flex_direction_row} onPress={onPostPress}>
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
    </View>
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

    // iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  mediaContent: {
    marginTop: 10,
    height: 150,
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

import {useRoute} from '@react-navigation/core';
import {useNavigation} from '@react-navigation/native';
import React, {useMemo, useRef} from 'react';
import {useContext} from 'react';
import {useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import PostCard from '../components/PostsFeed/PostCard';
import TextInputC from '../components/TextInputC';
import {gs} from '../constants/styles';
import {PostsContext} from '../context/PostsProvider';
import {Button} from '../components/Button';
import SendIcon from '../../assets/send.svg';
import axios from 'axios';
import useApi from '../hooks/useApi';
import api from '../constants/api';
import {Avatar} from '../components/Avatar';
import TextC from '../components/TextC';
import {date_to_string} from '../utils';
import Menu, {MenuItem} from 'react-native-material-menu';
import {AuthContext} from '../context/AuthProvider';

const CommentCard = ({comment}) => (
  <View style={styles.sectionContainer}>
    <View
      style={[
        styles.commentContainer,
        {
          maxWidth:
            Dimensions.get('window').width - Dimensions.get('window').width / 4,
        },
      ]}>
      <Avatar uri={comment.author.avatar_uri} remote size={45} />
      <View style={styles.commentContentContainer}>
        <View style={styles.commentTitle}>
          <TextC style={styles.commentUsername}>
            {comment.author.username.substring(0, 15)}{' '}
            {comment.author.username.length > 15 && '...'}
          </TextC>
          <TextC style={gs.subtitle}>
            le {date_to_string(comment.dateCreated)}
          </TextC>
        </View>
        <TextC>{comment.content}</TextC>
      </View>
    </View>
  </View>
);

const CommentsScreen = props => {
  const postsContext = useContext(PostsContext);
  const {user} = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
  const menuRefs = useRef({});

  const [post, setPost] = useState(route.params.post);
  const [comment, setComment] = useState('');
  const [inputHeight, setInputHeight] = useState(50);
  const [comments, isLoading, fetchComments] = useApi(
    api.comments_all + '?post_id=' + post._id,
  );

  const onDeletePost = id => {
    postsContext.deletePost(id);
    navigation.goBack();
  };

  const onNewComment = async () => {
    try {
      await axios.post(api.comment_add, {
        post_id: post._id,
        content: comment,
      });

      Keyboard.dismiss();
      setInputHeight(50);
      fetchComments();
      setPost(p => ({...p, commentsCount: p.commentsCount + 1}));
      postsContext.addComment(route.params.screen, post._id);
    } catch (err) {
      console.log(err);
      Alert.alert(
        '',
        err.response ? err.response.data : 'Il y a eu une erreur',
      );
    }
    setComment('');
  };

  const onCommentChange = text => {
    if (text.length < 1024) {
      setComment(text);
    } else {
      Alert.alert('', 'Le commentaire ne peut pas être plus long.');
    }
  };

  const goToPMs = withUser => () => {
    navigation.navigate('ConversationScreen', {withUser});
  };

  const removeComment = comment_id => () => {
    Alert.alert('', 'Êtes-vous sûr de vouloir supprimer ce commentaire ?', [
      {
        text: 'Oui',
        onPress: async () => {
          try {
            await axios.post(api.comment_delete, {
              post_id: post._id,
              comment_id,
            });
            fetchComments();
            setPost(p => ({...p, commentsCount: p.commentsCount - 1}));
            postsContext.deleteComment(post._id);
          } catch (err) {
            console.log(err);
            Alert.alert('', 'Il y a eu une erreur');
          }
        },
      },
      {text: 'Non', style: 'cancel'},
    ]);
  };

  const banUser = user_id => async () => {
    Alert.alert(
      '',
      'Êtes-vous sûr de vouloir bannir cet utilisateur ? Cette action est irréversible.',
      [
        {
          text: 'Oui',
          onPress: async () => {
            try {
              await axios.post(api.user_ban, {user_id});
              fetchComments();

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

  return (
    <KeyboardAwareFlatList
      refreshing={isLoading}
      onRefresh={fetchComments}
      style={styles.container}
      data={[{_id: 'post'}, {_id: 'write'}, ...comments]}
      keyExtractor={item => item._id}
      renderItem={({item, index}) =>
        index === 0 ? (
          <PostCard
            post={post}
            onDelete={onDeletePost}
            shouldReload
            screen={route.params.screen}
          />
        ) : index === 1 ? (
          <View style={styles.writeContainer}>
            <View style={gs.flex(1)}>
              <TextInputC
                multiline
                noMargin
                theme="gray"
                placeholder="Ecrire un commentaire"
                value={comment}
                onChangeText={onCommentChange}
                onContentSizeChange={e =>
                  setInputHeight(Math.max(50, e.nativeEvent.contentSize.height))
                }
                style={[styles.writeInput, {height: inputHeight}]}
                underlineColorAndroid="transparent"
              />
            </View>
            <Button
              style={styles.submit}
              onPress={onNewComment}
              disabled={!comment.trim()}>
              <SendIcon fill="white" height={18} width={18} />
            </Button>
          </View>
        ) : (
          <Menu
            ref={el => (menuRefs.current[item._id] = el)}
            button={
              <TouchableOpacity
                onPress={() => menuRefs.current[item._id].show()}>
                <CommentCard comment={item} />
              </TouchableOpacity>
            }>
            {(item.author._id === user._id || user.is_admin) && (
              <MenuItem onPress={removeComment(item._id)}>Supprimer</MenuItem>
            )}
            {user.is_admin && (
              <MenuItem onPress={banUser(item.author._id)}>Bannir</MenuItem>
            )}
            {item.author._id !== user._id && (
              <MenuItem onPress={goToPMs(item.author)}>Message privé</MenuItem>
            )}
          </Menu>
        )
      }
    />
  );
};

const styles = {
  container: {
    backgroundColor: gs.colors.white,
    flex: 1,
    paddingTop: 10,
  },
  writeInput: {
    marginLeft: 20,
    marginRight: 10,
    color: gs.colors.black,
    marginBottom: 8,
  },
  writeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  submit: {
    // alignItems: 'flex-end',
    // width: 40,
    // height: 40,
    marginBottom: 8,
    marginRight: 20,
    // padding: 2
  },
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  commentContainer: {
    marginRight: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  commentContentContainer: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.25,
    shadowRadius: 2,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  commentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUsername: {
    color: gs.colors.primary,
    fontSize: 14,
    marginRight: 5,
    fontWeight: 'bold',
  },
};

export default CommentsScreen;

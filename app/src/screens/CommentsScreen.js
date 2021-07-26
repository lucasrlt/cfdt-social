import {useRoute} from '@react-navigation/core';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {useContext} from 'react';
import {useState} from 'react';
import {Alert, Dimensions, FlatList, Keyboard, View} from 'react-native';
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
            {comment.author.username}
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
  const route = useRoute();
  const navigation = useNavigation();

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
      fetchComments();
      setPost(p => ({...p, commentsCount: p.commentsCount + 1}));
      postsContext.addComment(post._id);
    } catch (err) {
      console.log(err);
      Alert.alert(
        '',
        err.response ? err.response.data : 'Il y a eu une erreur',
      );
    }
    setComment('');
  };

  return (
    <View style={styles.container}>
      <PostCard post={post} onDelete={onDeletePost} shouldReload />

      <View style={styles.commentsSection}>
        <TextInputC
          multiline
          noMargin
          theme="gray"
          placeholder="Ecrire un commentaire"
          value={comment}
          onChangeText={setComment}
          onContentSizeChange={e =>
            setInputHeight(e.nativeEvent.contentSize.height)
          }
          style={[styles.writeInput, {height: inputHeight}]}
          underlineColorAndroid="transparent"
        />
        {comment ? (
          <View style={styles.submitContainer}>
            <Button style={styles.submit} onPress={onNewComment}>
              <SendIcon fill="white" height={20} width={20} />
            </Button>
          </View>
        ) : null}
      </View>

      <FlatList
        refreshing={isLoading}
        onRefresh={fetchComments}
        data={comments}
        keyExtractor={item => item._id}
        renderItem={({item}) => <CommentCard comment={item} />}
      />
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: gs.colors.white,
    flex: 1,
    paddingTop: 10,
  },
  writeInput: {
    marginHorizontal: 20,
    color: gs.colors.black,
    marginBottom: 8,
  },
  submitContainer: {
    alignItems: 'flex-end',
  },
  submit: {
    alignItems: 'flex-end',
    width: 40,
    height: 40,
    marginRight: 20,
  },
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  commentContainer: {
    marginRight: 20,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  commentContentContainer: {
    elevation: 5,
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

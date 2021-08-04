import React from 'react';
import {useEffect} from 'react';
import {useState} from 'react';
import {Alert} from 'react-native';
import api from '../constants/api';
import useApi from '../hooks/useApi';

export const PostsContext = React.createContext({
  posts: [],
});

const PostsProvider = ({children}) => {
  const [posts, isLoading, fetchPosts, setPosts] = useApi(api.posts_all);
  const [reloadIdx, setReloadIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      reload();
    }
  }, [isLoading]);

  const deletePost = id => {
    const postIndex = posts.findIndex(post => post._id === id);
    if (postIndex > -1) {
      const newPosts = posts;
      newPosts.splice(postIndex, 1);

      setPosts([...newPosts]);

      Alert.alert('', 'La publication a bien été supprimée.');
    }
  };

  const createPost = post => {
    if (post) {
      setPosts([post, ...posts]);
    }
  };

  const likePost = (id, shouldReload) => {
    const postIndex = posts.findIndex(post => post._id === id);
    if (postIndex > -1) {
      const newPosts = posts;
      newPosts[postIndex].likesCount += newPosts[postIndex].isLiked ? -1 : 1;
      newPosts[postIndex].isLiked = !newPosts[postIndex].isLiked;

      setPosts([...newPosts]);

      if (shouldReload) reload();
    }
  };

  const addComment = id => {
    const postIndex = posts.findIndex(post => post._id === id);
    if (postIndex > -1) {
      const newPosts = posts;
      newPosts[postIndex].commentsCount += 1;

      setPosts([...newPosts]);

      reload();
    }
  };

  const updatePoll = (id, poll) => {
    const postIndex = posts.findIndex(post => post._id === id);
    if (postIndex > -1) {
      const newPosts = posts;
      newPosts[postIndex].poll = poll;

      setPosts([...newPosts]);

      reload();
    }
  };

  const reload = () => {
    setReloadIdx(idx => idx + 1);
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        isLoading,
        fetchPosts,
        deletePost,
        createPost,
        likePost,
        reload,
        addComment,
        updatePoll,
        reloadIdx,
      }}>
      {children}
    </PostsContext.Provider>
  );
};

export default PostsProvider;

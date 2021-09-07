import axios from 'axios';
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
  const PAGE_SIZE = 10;

  const defaultState = {
    posts: [],
    isLoading: true,
    currentPage: 0,
    sort: 'recent',
    reloadIdx: 0,
  };
  const [data, setData] = useState({
    news: defaultState,
    feed: defaultState,
    self: defaultState,
  });

  const [reloadIdx, setReloadIdx] = useState(0);

  const onSortChange = (key, sort) => {
    setData(d => ({...d, [key]: {...d[key], sort, currentPage: 0}}));
    fetchPosts(key, 0, sort);
  };

  const onNextPage = key => {
    if (data[key].posts.length % PAGE_SIZE === 0) {
      fetchPosts(key, data[key].currentPage + 1);

      setData(d => ({
        ...d,
        [key]: {...d[key], currentPage: d[key].currentPage + 1},
      }));
    }
  };

  const onRefresh = key => {
    data[key].currentPage = 0;
    data[key].reloadIdx++;

    fetchPosts(key, 0);

    setData({...data});
  };

  const fetchPosts = async (key, page, sort) => {
    try {
      const p = page !== undefined ? page : data[key].currentPage;
      const s = sort !== undefined ? sort : data[key].sort;

      const apiUrl = new URL(api.posts_all);
      apiUrl.searchParams.append('sort', s);
      apiUrl.searchParams.append('page', p);
      apiUrl.searchParams.append('pageSize', PAGE_SIZE);
      if (key === 'news') apiUrl.searchParams.append('adminOnly', true);
      if (key === 'self') apiUrl.searchParams.append('selfOnly', true);

      setData(d => ({...d, [key]: {...d[key], isLoading: true}}));
      const res = await axios.get(apiUrl.toString());
      setData(d => ({
        ...d,
        [key]: {
          ...d[key],
          isLoading: false,
          posts: p === 0 ? res.data : [...d[key].posts, ...res.data],
          reloadIdx: d[key].reloadIdx + 1,
        },
      }));
    } catch (error) {
      console.log(error);
      setData(d => ({...d, [key]: {...d[key], isLoading: false}}));
      Alert.alert('', 'Il y a eu une erreur');
    }
  };

  const deletePost = (screen, id) => {
    Object.keys(data).forEach(key => {
      const postIndex = data[key].posts.findIndex(post => post._id === id);
      if (postIndex > -1) {
        const newPosts = data[key].posts;
        newPosts.splice(postIndex, 1);

        data[key].posts = newPosts;

        Alert.alert('', 'La publication a bien été supprimée.');
      }
    });
    setData({...data});
  };

  const createPost = (screen, post) => {
    if (post) {
      const keys = [screen, 'self'];
      keys.forEach(key => {
        data[key].posts = [post, ...data[key].posts];
      });

      setData({...data});
    }
  };

  const likePost = (screen, id, shouldReload) => {
    Object.keys(data).forEach(key => {
      const postIndex = data[key].posts.findIndex(post => post._id === id);
      if (postIndex > -1) {
        const newPosts = data[key].posts;
        newPosts[postIndex].likesCount += newPosts[postIndex].isLiked ? -1 : 1;
        newPosts[postIndex].isLiked = !newPosts[postIndex].isLiked;

        data[key].posts = newPosts;
        data[key].reloadIdx++;

        // if (shouldReload) reload();
      }
    });
    setData({...data});
  };

  const addComment = (screen, id) => {
    Object.keys(data).forEach(key => {
      const postIndex = data[key].posts.findIndex(post => post._id === id);
      if (postIndex > -1) {
        const newPosts = data[key].posts;
        newPosts[postIndex].commentsCount += 1;

        data[key].posts = newPosts;

        reload();
      }
    });

    setData({...data});
  };

  const deleteComment = id => {
    Object.keys(data).forEach(key => {
      const postIndex = data[key].posts.findIndex(post => post._id === id);
      if (postIndex > -1) {
        const newPosts = data[key].posts;
        newPosts[postIndex].commentsCount -= 1;

        data[key].posts = newPosts;

        reload();
      }
    });
  };

  const updatePoll = (screen, id, poll) => {
    Object.keys(data).forEach(key => {
      const postIndex = data[key].posts.findIndex(post => post._id === id);
      if (postIndex > -1) {
        const newPosts = data[key].posts;
        newPosts[postIndex].poll = poll;

        data[key].posts = newPosts;

        reload();
      }
    });

    setData({...data});
  };

  const reload = () => {
    setReloadIdx(idx => idx + 1);
  };

  return (
    <PostsContext.Provider
      value={{
        data,
        onSortChange,
        fetchPosts,
        deletePost,
        onRefresh,
        createPost,
        likePost,
        reload,
        addComment,
        updatePoll,
        onNextPage,
        deleteComment,
        reloadIdx,
      }}>
      {children}
    </PostsContext.Provider>
  );
};

export default PostsProvider;

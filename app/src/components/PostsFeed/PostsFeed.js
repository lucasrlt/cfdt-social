import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {gs} from '../../constants/styles';
import PostWriteButton from './PostWriteButton';
import useApi from '../../hooks/useApi';
import api from '../../constants/api';
import PostCard from './PostCard';
import {PostsContext} from '../../context/PostsProvider';
import {useContext} from 'react';
import {AuthContext} from '../../context/AuthProvider';
import {useNavigation} from '@react-navigation/native';
import TextC from '../TextC';

// sort: oneOf['recent', 'hot', 'controversial']
const PostsFeed = ({restrictAdmin, restrictSelf, sort}) => {
  useEffect(() => {
    postsContext.onSortChange(key, sort);
    flatlistRef.current.scrollToOffset({animated: true, offset: 0});
  }, [sort]);

  const authContext = useContext(AuthContext);
  const postsContext = useContext(PostsContext);

  const flatlistRef = useRef();

  const renderPost = ({item, index}) => (
    <PostCard post={item} key={index} screen={key} />
  );

  const canWrite =
    (restrictAdmin && authContext.user.is_admin) ||
    (!authContext.user.is_admin && !restrictAdmin && !restrictSelf);

  const key = restrictAdmin ? 'news' : restrictSelf ? 'self' : 'feed';
  const data = postsContext.data[key];

  const onRefresh = () => {
    postsContext.onRefresh(key);
  };
  const onNextPage = () => postsContext.onNextPage(key);
  const onCreate = post => postsContext.createPost(key, post);

  return (
    <View style={gs.flex(1)}>
      {canWrite && <PostWriteButton onCreatePost={onCreate} />}

      <FlatList
        ref={flatlistRef}
        data={data.posts}
        renderItem={renderPost}
        keyExtractor={item => item._id}
        refreshing={data.isLoading}
        onRefresh={onRefresh}
        onEndReached={onNextPage}
        onEndReachedThreshold={0.1}
        extraData={data.reloadIdx}
        ListEmptyComponent={() => (
          <TextC
            style={[
              gs.subtitle,
              {
                textAlign: 'center',
                marginTop: '50%',
              },
            ]}>
            Il n'y a aucune publication à afficher
          </TextC>
        )}
      />
    </View>
  );
};

export default PostsFeed;

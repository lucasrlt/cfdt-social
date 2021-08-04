import React from 'react';
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
  const {posts, isLoading, fetchPosts, deletePost, createPost, reloadIdx} =
    useContext(PostsContext);

  const authContext = useContext(AuthContext);

  const renderPost = ({item, index}) => (
    <PostCard post={item} key={index} onDelete={deletePost} />
  );

  const canWrite =
    (restrictAdmin && authContext.user.is_admin) ||
    (!authContext.user.is_admin && !restrictAdmin && !restrictSelf);

  const data = restrictAdmin
    ? posts.filter(p => p.author.is_admin)
    : restrictSelf
    ? posts.filter(p => p.isAuthor)
    : posts.filter(p => !p.author.is_admin);

  return (
    <View style={gs.flex(1)}>
      {canWrite && <PostWriteButton onCreatePost={createPost} />}

      <FlatList
        data={data}
        renderItem={renderPost}
        keyExtractor={item => item._id}
        refreshing={isLoading}
        onRefresh={fetchPosts}
        extraData={reloadIdx}
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

import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {View, Image} from 'react-native';
import {Avatar} from '../components/Avatar';
import {Button} from '../components/Button';
import PostsFeed from '../components/PostsFeed/PostsFeed';
import SortButton from '../components/SortButton';
import TextC from '../components/TextC';
import api from '../constants/api';
import {gs} from '../constants/styles';
import {AuthContext} from '../context/AuthProvider';

const CfdtNewsScreen = () => {
  const authContext = React.useContext(AuthContext);
  const [sort, setSort] = useState('recent');

  React.useEffect(() => {
    console.log('Neeews', sort);
  }, [sort]);

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (isFocused) {
      const stack = navigation.dangerouslyGetParent();
      stack.setOptions({
        headerRight: () => <SortButton onSort={setSort} />,
      });
    }
  }, [isFocused]);

  return (
    <View style={[gs.containers.primary, {padding: 0}]}>
      <PostsFeed restrictAdmin sort={sort} />
    </View>
  );
};

export default CfdtNewsScreen;

import React, {useRef} from 'react';
import {StyleSheet} from 'react-native';
import {Button} from './Button';
import SortIcon from '../../assets/sort.svg';
import Menu, {MenuItem} from 'react-native-material-menu';

const SortButton = ({onSort}) => {
  const menuRef = useRef(null);

  const onMenuOpen = () => menuRef.current.show();
  const onSortWrapper = key => () => {
    menuRef.current.hide();
    if (onSort) onSort(key);
  };

  const sortOptions = [
    {key: 'recent', title: 'Les plus récents'},
    {key: 'hot', title: 'Les plus aimés'},
    {key: 'controversial', title: 'Les plus commentés'},
  ];

  return (
    <Menu
      ref={menuRef}
      button={
        <Button style={styles.button} onPress={onMenuOpen}>
          <SortIcon fill="white" />
        </Button>
      }>
      {sortOptions.map((option, key) => (
        <MenuItem key={key} onPress={onSortWrapper(option.key)}>
          {option.title}
        </MenuItem>
      ))}
    </Menu>
  );
};

const styles = StyleSheet.create({
  button: {padding: 0, marginRight: 14},
});

export default SortButton;

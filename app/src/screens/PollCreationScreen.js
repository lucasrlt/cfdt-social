import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import TextC from '../components/TextC';
import TextInputC from '../components/TextInputC';
import CloseIcon from '../../assets/close.svg';
import {gs} from '../constants/styles';
import {Button} from '../components/Button';
import {useNavigation} from '@react-navigation/core';
import CheckmarkIcon from '../../assets/checkmark.svg';
import {useRoute} from '@react-navigation/native';

const PollCreationScreen = props => {
  /// SETUP
  const [poll, setPoll] = useState({
    question: '',
    options: [{title: ''}],
    answers: [],
  });

  const navigation = useNavigation();
  navigation.setOptions({
    headerRight: () => (
      <Button style={styles.validateButton} onPress={onSubmit}>
        <CheckmarkIcon fill="white" />
      </Button>
    ),
  });

  const route = useRoute();

  /// CALLBACKS
  const onOptionChange = idx => txt => {
    const newPoll = {...poll};
    newPoll.options[idx] = {title: txt};
    setPoll(newPoll);
  };

  const onOptionRemove = idx => () => {
    const newPoll = {...poll};
    newPoll.options.splice(idx, 1);
    setPoll(newPoll);
  };

  const onChangeQuestion = txt => {
    setPoll({...poll, question: txt});
  };

  const onOptionAdd = () => {
    const newPoll = {...poll};
    newPoll.options.push({title: ''});
    setPoll(newPoll);
  };

  const onSubmit = () => {
    if (poll.question.trim().length === 0) {
      return Alert.alert('Erreur', 'Il faut entrer une question');
    }
    if (poll.options.some(opt => opt.title.trim().length === 0)) {
      return Alert.alert('Erreur', 'Les réponses ne peuvent pas être vides');
    }

    route.params.onSubmit(poll);
    navigation.goBack();
  };

  return (
    <ScrollView style={gs.containers.primary}>
      <TextC style={[gs.title, styles.title]}>Posez votre question:</TextC>
      <TextInputC
        theme="gray"
        color="black"
        placeholder="Question?"
        onChangeText={onChangeQuestion}
        underlineColorAndroid="transparent"
      />

      <TextC style={gs.title}>Choisissez les réponses possibles:</TextC>

      {poll.options.map((option, idx) => (
        <View style={styles.optionRow}>
          <TextInputC
            containerStyle={gs.flex(1)}
            color="black"
            value={option.title}
            placeholder={`Réponse ${idx + 1}`}
            key={idx}
            theme="gray"
            underlineColorAndroid="transparent"
            noMargin
            onChangeText={onOptionChange(idx)}
          />
          {poll.options.length > 1 && (
            <CloseIcon
              style={{marginLeft: 10}}
              fill={gs.colors.primary}
              onPress={onOptionRemove(idx)}
            />
          )}
        </View>
      ))}

      <Button isText onPress={onOptionAdd} style={{marginBottom: 20}}>
        Ajouter une option
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  validateButton: {padding: 0, marginRight: 14},
  title: {marginBottom: 5},
  optionRow: {
    marginTop: 5,
    marginBottom: 5,
    alignItems: 'center',
    flexDirection: 'row',
    // backgroundColor: 'red',
  },
});

export default PollCreationScreen;

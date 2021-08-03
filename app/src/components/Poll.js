import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {gs} from '../constants/styles';
import {Button} from './Button';
import RadioButton from './RadioButton';
import TextC from './TextC';

const Poll = ({
  question,
  options,
  votesCount,
  canVote,
  onVote,
  showResults,
  userAnswer,
  ...props
}) => {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (userAnswer && userAnswer.answer) {
      setSelected(userAnswer.answer);
    }
  }, [userAnswer]);

  const getVoteProportion = vote => {
    if (votesCount === 0) return 0;
    return Math.round((vote / votesCount) * 100);
  };

  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.options}>
        <TextC style={styles.question}>{question}</TextC>

        {options.map((option, key) => (
          <View style={styles.optionRow} key={key}>
            <RadioButton
              disabled={showResults || !canVote}
              tint={gs.colors.primary}
              size={20}
              onPress={() => setSelected(key)}
              selected={selected === key}
            />
            {showResults && (
              <View
                style={[
                  styles.voteResultBar,
                  {
                    width: getVoteProportion(option.votesCount) - 10 + '%',
                  },
                ]}
              />
            )}
            <TextC style={styles.optionTitle}>
              {option.title}{' '}
              {showResults
                ? '(' + getVoteProportion(option.votesCount) + '%)'
                : ''}
            </TextC>
          </View>
        ))}
      </View>

      <View style={showResults ? null : styles.voting}>
        {!showResults && (
          <Button
            style={styles.voteButton}
            fontSize={12}
            disabled={!canVote || selected === null}
            onPress={onVote(selected)}>
            Voter
          </Button>
        )}
        <TextC
          style={[
            gs.subtitle,
            styles.votesCount,
            {marginBottom: showResults ? 10 : 0},
          ]}>
          {votesCount || 0} votes{' '}
        </TextC>
      </View>
    </View>
  );
};

Poll.defaultProps = {
  onVote: () => {},
};

const styles = StyleSheet.create({
  container: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 10,
  },
  voteButton: {padding: 5},
  votesCount: {marginLeft: 15},
  voting: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    borderTopWidth: 1,
    borderTopColor: '#CCC',
  },
  options: {
    padding: 15,
    borderBottomColor: '#ccc',
  },
  optionRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  optionTitle: {
    marginLeft: 10,
    color: 'black',
    fontSize: 16,
  },
  voteResultBar: {
    height: '100%',
    borderRadius: 6,
    marginLeft: 25,
    backgroundColor: gs.colors.primary + '44',
    position: 'absolute',
  },
});

export default Poll;

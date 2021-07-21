const constants = {
  colors: {
    primary: '#E7591C',
    black: '#000000',
    white: '#ffffff',
    subtitle: '#808080',
  },
  paddings: {
    small: 20,
    medium: 30,
    large: 50,
  },
  font: {
    small: 14,
    normal: 16,
  },
};

const reusable_styles = {
  c_white: {color: constants.colors.white},
  c_dark: {color: constants.colors.black},
  flex: n => ({
    flex: n,
  }),
  bold: {fontWeight: 'bold'},
  small_margin: {marginTop: 10},
  center: {alignItems: 'center', textAlign: 'center'},
  containers: {
    primary_fill: {
      flex: 1,
      backgroundColor: constants.colors.primary,
    },
  },
};

export const gs = {
  ...constants,
  ...reusable_styles,
};

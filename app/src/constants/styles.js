const constants = {
  colors: {
    primary: '#E7591C',
    black: '#000000',
    white: '#ffffff',
    subtitle: '#808080',
    light_gray: '#ededed',
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
  c_primary: {color: constants.colors.primary},
  font_title: {fontSize: 18},
  title: {fontSize: 20, color: constants.colors.primary, fontWeight: 'bold'},
  flex: n => ({
    flex: n,
  }),
  flex_direction_row: {flexDirection: 'row'},
  subtitle: {fontSize: 12, color: constants.colors.subtitle},
  bold: {fontWeight: 'bold'},
  small_margin: {marginTop: 10},
  center: {alignItems: 'center', textAlign: 'center'},
  containers: {
    primary: {
      flex: 1,
      backgroundColor: constants.colors.white,
      padding: constants.paddings.small,
    },
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

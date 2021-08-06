const NODE_ENV = 'development';
const SERVER_HOST = (NODE_ENV = 'development'
  ? 'http://192.168.1.30:8000'
  : 'http://enscene.lucasrlt.com');

export default {
  user_login: SERVER_HOST + '/users/login',
  user_has_logged: SERVER_HOST + '/users/hasLoggedIn',
  user_setup_profile: SERVER_HOST + '/users/setupProfile',
  user_avatar: SERVER_HOST + '/uploaded_files/',
  user_update_profile: SERVER_HOST + '/users/updateProfile',
  users_all: SERVER_HOST + '/users/all',
  user_remove_notification_token:
    SERVER_HOST + '/users/removeNotificationToken',
  user_reset_password: SERVER_HOST + '/users/resetPassword',

  post_new: SERVER_HOST + '/posts/new',
  posts_all: SERVER_HOST + '/posts/all',
  post_like: SERVER_HOST + '/posts/like',
  post_delete: SERVER_HOST + '/posts/delete',
  post_poll_vote: SERVER_HOST + '/posts/pollVote',

  comment_add: SERVER_HOST + '/posts/newComment',
  comments_all: SERVER_HOST + '/posts/allComments',

  chat_get_conversations: SERVER_HOST + '/chats/conversations',
  chat_get_messages: SERVER_HOST + '/chats/all',
  chat_new_message: SERVER_HOST + '/chats/new',

  avatar: filename => SERVER_HOST + '/uploaded_files/' + filename,

  adhesion_page:
    'https://www.cfdt.fr/portail/adhesion/adherez-en-ligne-jca_221287',
};

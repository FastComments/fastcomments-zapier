import zapier, { defineApp } from 'zapier-platform-core';
import packageJson from '../package.json' with { type: 'json' };
import authentication from './authentication.js';
import { afters, befores } from './middleware.js';
import newComment from './triggers/new_comment.js';
import updatedComment from './triggers/updated_comment.js';
import deletedComment from './triggers/deleted_comment.js';
import domainConfigList from './triggers/domain_config_list.js';
import createComment from './creates/comment.js';
import createPage from './creates/page.js';
import createSSOUser from './creates/sso_user.js';
import createFeedPost from './creates/feed_post.js';
import createHashTag from './creates/hash_tag.js';
import flagComment from './creates/flag_comment.js';
import findComment from './searches/comment.js';
import findSSOUser from './searches/sso_user.js';
import findPage from './searches/page.js';

export default defineApp({
  version: packageJson.version,
  platformVersion: zapier.version,
  authentication,
  beforeRequest: [...befores],
  afterResponse: [...afters],
  triggers: {
    [newComment.key]: newComment,
    [updatedComment.key]: updatedComment,
    [deletedComment.key]: deletedComment,
    [domainConfigList.key]: domainConfigList,
  },
  creates: {
    [createComment.key]: createComment,
    [createPage.key]: createPage,
    [createSSOUser.key]: createSSOUser,
    [createFeedPost.key]: createFeedPost,
    [createHashTag.key]: createHashTag,
    [flagComment.key]: flagComment,
  },
  searches: {
    [findComment.key]: findComment,
    [findSSOUser.key]: findSSOUser,
    [findPage.key]: findPage,
  },
  // Pairing a search with its create is what gives the editor the "create if it doesn't exist" toggle.
  searchOrCreates: {
    [findSSOUser.key]: {
      key: findSSOUser.key,
      display: {
        label: 'Find or Create SSO User',
        description: 'Finds a single sign-on user by email, creating the user when there is none.',
      },
      search: findSSOUser.key,
      create: createSSOUser.key,
    },
    [findPage.key]: {
      key: findPage.key,
      display: {
        label: 'Find or Create Page',
        description: 'Finds a page by URL ID, creating the page when there is none.',
      },
      search: findPage.key,
      create: createPage.key,
    },
  },
});

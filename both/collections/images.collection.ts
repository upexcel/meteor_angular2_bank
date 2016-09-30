import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { UploadFS } from 'meteor/jalik:ufs';
 
import { Image, Thumb } from '../interfaces/image.interface';
 
export const Images = new Mongo.Collection<Image>('images');
export const Thumbs = new Mongo.Collection<Thumb>('thumbs');

//export const Images = new Mongo.Collection('images');
//export const Thumbs = new Mongo.Collection('thumbs');
// 
//function loggedIn(userId) {
//  return !!userId;
//}
// 
//Thumbs.allow({
//  insert: loggedIn,
//  update: loggedIn,
//  remove: loggedIn
//});
// 
//Images.allow({
//  insert: loggedIn,
//  update: loggedIn,
//  remove: loggedIn
//});

export const ThumbsStore = new UploadFS.store.GridFS({
  collection: Thumbs,
  name: 'thumbs',
    transformWrite(from, to, fileId, file) {
    // Resize to 32x32
    const gm = require('gm');
 
    gm(from, file.name)
      .resize(32, 32)
      .gravity('Center')
      .extent(32, 32)
      .quality(75)
      .stream()
      .pipe(to);
  }
});
 
export const ImagesStore = new UploadFS.store.GridFS({
  collection: Images,
  name: 'images',
  filter: new UploadFS.Filter({
    contentTypes: ['image/*']
  }),
  copyTo: [
    ThumbsStore
  ]
});

Thumbs.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});
 
Images.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});
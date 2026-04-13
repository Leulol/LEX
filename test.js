const userLeft = false;
const userWatchingCatMeme = false;

// function watchTutorialCallback(callback, errorCallback) {
//     if(userLeft) {
//         errorCallback({
//             name: 'User Left',
//             message: ':('
//         });
//     } else if(userWatchingCatMeme) {
//         errorCallback({
//             name: 'User Watching Cat Meme',
//             message: 'Boneventures < Cat memes'
//         });

//     } else {
//         callback('Boneventures viral video');
//     }
// }

let watchTutorialPromise = new Promise((resolve, reject) => {
    if(userLeft) {
        reject({
            name: 'User Left',
            message: ':('
        });
    } else if(userWatchingCatMeme) {
        reject({
            name: 'User Watching Cat Meme',
            message: 'Boneventures < Cat memes'
        });
    } else {
        resolve('Boneventures viral video');//the ones in the single parrameter are the messages for the output
    }
})

watchTutorialPromise.then((message) => {//message is the resolve so it will print out the resolve value
    console.log('Success: ' + message);
}).catch((error) => {//the error is the reject as we used catch to specify the error callback
    console.log(error.name + ' ' + error.message);
});
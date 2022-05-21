const functions = require('firebase-functions');
const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;

admin.initializeApp();
admin.firestore().settings({ignoreUndefinedProperties:true});

class UnauthenticatedError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.type = 'UnauthenticatedError';
    }
}

class NotAnAdminError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.type = 'NotAnAdminError';
    }
}

class InvalidRoleError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.type = 'InvalidRoleError';
    }
}

function roleIsValid(role) {
    const validRoles = ['user','admin']; //To be adapted with your own list of roles
    return validRoles.includes(role);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

exports.createUser = functions.https.onCall(async (data, context) => {

    try {

        //Checking that the user calling the Cloud Function is authenticated
        if (!context.auth) {
            throw new UnauthenticatedError('The user is not authenticated. Only authenticated Admin users can create new users.');
        }

        //Checking that the user calling the Cloud Function is an Admin user
        const callerUid = context.auth.uid;  //uid of the user calling the Cloud Function
        const callerUserRecord = await admin.auth().getUser(callerUid);
        if (!callerUserRecord.customClaims.admin) {
            throw new NotAnAdminError('Only Admin users can create new users.');
        }

        //Checking that the new user role is valid
        // const role = data.role;
        // if (!roleIsValid(role)) {
        //     throw new InvalidRoleError('The "' + role + '" role is not a valid role');
        // }


        const userCreationRequest = {
            userDetails: data,
            status: 'Pending',
            createdBy: callerUid,
            createdOn: FieldValue.serverTimestamp()
        }

        const userCreationRequestRef = await admin.firestore().collection("userCreationRequests").add(userCreationRequest);


        const newUser = {
            email: data.email,
            emailVerified: true,
            password: data.password,
            displayName: data.username,
            disabled: false
        }

        const userRecord = await admin
            .auth()
            .createUser(newUser);

        const userId = userRecord.uid;

        // const claims = {};
        // claims[role] = true;
        // claims['xyzCompanyUser'] = true;

        // await admin.auth().setCustomUserClaims(userId, claims);

        await admin.firestore().collection("users").doc(userId).set({
            uid: userId,
            username: data.username,
            email: data.email,
            phoneNumber: data.phoneNumber,
            address: data.address,
        });

        await userCreationRequestRef.update({ status: 'Treated' });

        return { result: 'The new user has been successfully created.' };


    } catch (error) {

        if (error.type === 'UnauthenticatedError') {
            throw new functions.https.HttpsError('unauthenticated', error.message);
        } else if (error.type === 'NotAnAdminError' || error.type === 'InvalidRoleError') {
            throw new functions.https.HttpsError('failed-precondition', error.message);
        } else {
            throw new functions.https.HttpsError('internal', error.message);
        }

    }

});


exports.deleteUser = functions.https.onCall(async (data, context) => {

    try {

        //Checking that the user calling the Cloud Function is authenticated
        if (!context.auth) {
            throw new UnauthenticatedError('The user is not authenticated. Only authenticated Admin users can delete users.');
        }

        //Checking that the user calling the Cloud Function is an Admin user
        const callerUid = context.auth.uid;  //uid of the user calling the Cloud Function
        const callerUserRecord = await admin.auth().getUser(callerUid);
        if (!callerUserRecord.customClaims.admin) {
            throw new NotAnAdminError('Only Admin users can delete users.');
        }

        //Checking that the new user role is valid
        // const role = data.role;
        // if (!roleIsValid(role)) {
        //     throw new InvalidRoleError('The "' + role + '" role is not a valid role');
        // }

        const userRecord = await admin
            .auth()
            .deleteUser(data.uid);

        await admin.firestore().collection("users").doc(data.uid).delete();


        return { result: 'The new user has been successfully deleted.' };


    } catch (error) {

        if (error.type === 'UnauthenticatedError') {
            throw new functions.https.HttpsError('unauthenticated', error.message);
        } else if (error.type === 'NotAnAdminError' || error.type === 'InvalidRoleError') {
            throw new functions.https.HttpsError('failed-precondition', error.message);
        } else {
            throw new functions.https.HttpsError('internal', error.message);
        }

    }

});


exports.createDriver = functions.https.onCall(async (data, context) => {

    try {

        //Checking that the user calling the Cloud Function is authenticated
        if (!context.auth) {
            throw new UnauthenticatedError('The user is not authenticated. Only authenticated Admin users can create new users.');
        }

        //Checking that the user calling the Cloud Function is an Admin user
        const callerUid = context.auth.uid;  //uid of the user calling the Cloud Function
        const callerUserRecord = await admin.auth().getUser(callerUid);
        if (!callerUserRecord.customClaims.admin) {
            throw new NotAnAdminError('Only Admin users can create new users.');
        }

        //Checking that the new user role is valid
        // const role = data.role;
        // if (!roleIsValid(role)) {
        //     throw new InvalidRoleError('The "' + role + '" role is not a valid role');
        // }


        const userCreationRequest = {
            userDetails: data,
            status: 'Pending',
            createdBy: callerUid,
            createdOn: FieldValue.serverTimestamp()
        }

        const userCreationRequestRef = await admin.firestore().collection("userCreationRequests").add(userCreationRequest);


        const newUser = {
            email: data.email,
            emailVerified: true,
            password: data.password,
            displayName: data.username,
            disabled: false
        }

        const userRecord = await admin
            .auth()
            .createUser(newUser);

        const userId = userRecord.uid;

        // const claims = {};
        // claims[role] = true;
        // claims['xyzCompanyUser'] = true;

        // await admin.auth().setCustomUserClaims(userId, claims);

        await admin.firestore().collection("drivers").doc(userId).set({
            uid: userId,
            username: data.username,
            email: data.email,
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            NIC: data.NIC || "",
            age: data.age || "",
            ambulanceNumber: data.ambulanceNumber || "",
            active: true,
            enabled: data.enabled || false
        });

        await userCreationRequestRef.update({ status: 'Treated' });

        return { result: 'The new user has been successfully created.' };


    } catch (error) {

        if (error.type === 'UnauthenticatedError') {
            throw new functions.https.HttpsError('unauthenticated', error.message);
        } else if (error.type === 'NotAnAdminError' || error.type === 'InvalidRoleError') {
            throw new functions.https.HttpsError('failed-precondition', error.message);
        } else {
            throw new functions.https.HttpsError('internal', error.message);
        }

    }

});


exports.deleteDriver = functions.https.onCall(async (data, context) => {

    try {

        //Checking that the user calling the Cloud Function is authenticated
        if (!context.auth) {
            throw new UnauthenticatedError('The user is not authenticated. Only authenticated Admin users can delete users.');
        }

        //Checking that the user calling the Cloud Function is an Admin user
        const callerUid = context.auth.uid;  //uid of the user calling the Cloud Function
        const callerUserRecord = await admin.auth().getUser(callerUid);
        if (!callerUserRecord.customClaims.admin) {
            throw new NotAnAdminError('Only Admin users can delete users.');
        }

        //Checking that the new user role is valid
        // const role = data.role;
        // if (!roleIsValid(role)) {
        //     throw new InvalidRoleError('The "' + role + '" role is not a valid role');
        // }

        const userRecord = await admin
            .auth()
            .deleteUser(data.uid);

        await admin.firestore().collection("drivers").doc(data.uid).delete();


        return { result: 'The new user has been successfully deleted.' };


    } catch (error) {

        if (error.type === 'UnauthenticatedError') {
            throw new functions.https.HttpsError('unauthenticated', error.message);
        } else if (error.type === 'NotAnAdminError' || error.type === 'InvalidRoleError') {
            throw new functions.https.HttpsError('failed-precondition', error.message);
        } else {
            throw new functions.https.HttpsError('internal', error.message);
        }

    }

});

// exports.makeAdmin = functions.https.onCall(async (data, context) => {

//         const claims = {};
//         claims['admin'] = true;
    
//         await admin.auth().setCustomUserClaims('lqPaab0Lt5Yz2hwHWtufNfhgQa03', claims);
//         return { result: 'Success' };
//     });

exports.requestRide = functions.https.onCall(async (data, context) =>{

    const {requestUid, startLat, startLng, destLat, destLng} = data


    const FCMTokens = []
    const snapshot = await admin.firestore().collection('drivers').get();

    const locations = await admin.database().ref("last_seen").once('value');

    const locationMap={}
    locations.forEach((locationRef)=>{
        locationMap[locationRef.key] = locationRef.val()
    })

    
    // allTokens.docs.forEach((tokenDoc) => {
    //     FCMTokens.push(tokenDoc.FCMToken);
    // });
    snapshot.forEach(doc => {
        const {uid, active, FCMToken, enabled} = doc.data()

        const {latitude, longitude} = locationMap[uid] || {};

        if(active && enabled && latitude && getDistanceFromLatLonInKm(latitude, longitude, startLat, startLng) <= 5){
            FCMTokens.push( FCMToken );
        }
     });
     console.log(FCMTokens)


    await admin.database().ref("ongoing/"+requestUid).set({
        driver: null,
        startLat: `${startLat}`,
        startLng: `${startLng}`,
        destLat: `${destLat}`,
        destLng: `${destLng}`,
    });
    
    const payload = {
        // notification: {
        //     title: 'Emergency Ride Request',
        //     body: `lat: ${lat} lng: ${lng}`
        // },
        data:{
            title: 'Emergency Ride Request',
            body: `lat: ${startLat} lng: ${startLng}`,
            requestUid: `${requestUid}`,
            startLat: `${startLat}`,
            startLng: `${startLng}`,
            destLat: `${destLat}`,
            destLng: `${destLng}`,
        }
        
    };

    
    // setInterval(()=>{
    //     admin.database().ref("ongoing/"+uid).remove()
    // }, 30000)
    
    // const response = await admin.messaging().send(payload)
    const response = await admin.messaging().sendToDevice(FCMTokens, payload);
    
    return {success: true};
})

exports.forwardRide = functions.https.onCall(async (data, context) =>{

    const {requestUid, driverUid, startLat, startLng, destLat, destLng} = data


    const FCMTokens = []
    const snapshot = await admin.firestore().collection('drivers').get();

    const locations = await admin.database().ref("last_seen").once('value');

    const locationMap={}
    locations.forEach((locationRef)=>{
        locationMap[locationRef.key] = locationRef.val()
    })

    

    snapshot.forEach(doc => {

        const {uid, active, FCMToken, enabled} = doc.data()

        if(data.uid != driverUid){

            const {latitude, longitude} = locationMap[uid] || {};

            if(active && enabled && latitude && getDistanceFromLatLonInKm(latitude, longitude, startLat, startLng) <= 5){
                FCMTokens.push( FCMToken );
            }
        }
     });
    
    const payload = {
        // notification: {
        //     title: 'Emergency Ride Request',
        //     body: `lat: ${lat} lng: ${lng}`
        // },
        data:{
            title: 'Emergency Ride Request',
            body: `lat: ${startLat} lng: ${startLng}`,
            requestUid: `${requestUid}`,
            startLat: `${startLat}`,
            startLng: `${startLng}`,
            destLat: `${destLat}`,
            destLng: `${destLng}`,
        }
        
    };

    await admin.database().ref("ongoing/"+requestUid).set({driver: null});
    
    const response = await admin.messaging().sendToDevice(FCMTokens, payload);
    
    return {success: true};
})

exports.getDriverHistory = functions.https.onCall(async (data, context) =>{

    const { uid } = data


    const history = await admin.firestore().collection('history').where("driver", "==", uid).get();

    if (history.docs.length === 0){

        return {success: []}
    }
    const users = await admin.firestore().collection('users').where("uid", "in", history.docs.map(doc=>doc.data().user)).get();

    const usersMap = {}

    users.forEach(doc=>{
        usersMap[doc.id] = doc.data();
    })

    const historyWithData = history.docs.map(doc=>{
        const  {date, user } = doc.data();
        return {
            date,
            user: usersMap[user]
        }
    })
    
    return {success: historyWithData};
})


exports.getUserHistory = functions.https.onCall(async (data, context) =>{

    const { uid } = data


    const history = await admin.firestore().collection('history').where("user", "==", uid).get();

    if (history.docs.length === 0){

        return {success: []}
    }
    const drivers = await admin.firestore().collection('drivers').where("uid", "in", history.docs.map(doc=>doc.data().driver)).get();

    const driversMap = {}

    drivers.forEach(doc=>{
        driversMap[doc.id] = doc.data();
    })

    const historyWithData = history.docs.map(doc=>{
        const  {date, driver } = doc.data();
        return {
            date,
            driver: driversMap[driver]
        }
    })
    
    return {success: historyWithData};
})
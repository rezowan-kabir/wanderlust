import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins"
const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("wamderlust");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plagins:[jwt()],
  session:{
    cookieCache:{
        enabled: true,
        strategy: 'jwt',
        maxAge: 5*24*60*60  //5 days
    }
  },



  // Extra profile fields shown on /profile. Optional so existing users (and
  // sign-ups that omit them) stay valid; MongoDB needs no migration for these.
  user: {
    additionalFields: {
      location: { type: "string", required: false, defaultValue: "" },
      nationality: { type: "string", required: false, defaultValue: "" },
    },
  },
//   socialProviders: {
//     github: { 
//       clientId: process.env.GITHUB_CLIENT_ID as string, 
//       clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
//     }, 
//   },

});
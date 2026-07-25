import { describe, it, expect } from "vitest";
import { mapDocToUser, mapFirebaseUserToUser } from "../../../../src/lib/helpers/userMappers";

describe("userMappers", () => {
  describe("mapDocToUser", () => {
    it("should map a complete Firestore document to a User object", () => {
      const data = {uid:"user-123",name:"Juan Pérez",email:"juan@campfit.app",role:"client",hasActiveAlert:true,assignedTrainerId:"trainer-1",medicalProfile:{allergies:["polen"],injuries:[],conditions:[],goals:["perder peso"],experience:"beginner",birthDate:null,height:170,initialWeight:80},lastActivityAt:new Date("2024-06-01"),createdAt:new Date("2024-01-01"),updatedAt:new Date("2024-06-15")};
      const user=mapDocToUser(data);
      expect(user.uid).toBe("user-123");
      expect(user.name).toBe("Juan Pérez");
      expect(user.email).toBe("juan@campfit.app");
      expect(user.role).toBe("client");
      expect(user.hasActiveAlert).toBe(true);
      expect(user.assignedTrainerId).toBe("trainer-1");
      expect(user.medicalProfile).toEqual({allergies:["polen"],injuries:[],conditions:[],goals:["perder peso"],experience:"beginner",birthDate:null,height:170,initialWeight:80});
      expect(user.lastActivityAt).toEqual(data.lastActivityAt);
      expect(user.createdAt).toEqual(data.createdAt);
      expect(user.updatedAt).toEqual(data.updatedAt);
    });
    it("should map admin and trainer roles",()=>{expect(mapDocToUser({uid:"a",role:"admin"}).role).toBe("admin");expect(mapDocToUser({uid:"a",role:"trainer"}).role).toBe("trainer");});
    it("should fallback to empty strings for missing uid, name, email",()=>{const user=mapDocToUser({});expect(user.uid).toBe("");expect(user.name).toBe("Sin nombre");expect(user.email).toBe("");});
    it("should use provided fallbackName",()=>{expect(mapDocToUser({uid:"u1"},"Invitado").name).toBe("Invitado");});
    it("should default role to client when missing",()=>{expect(mapDocToUser({uid:"u1"}).role).toBe("client");});
    it("should default hasActiveAlert to false when missing",()=>{expect(mapDocToUser({uid:"u1"}).hasActiveAlert).toBe(false);});
    it("should set hasActiveAlert to false when null",()=>{expect(mapDocToUser({uid:"u1",hasActiveAlert:null}).hasActiveAlert).toBe(false);});
    it("should keep assignedTrainerId as undefined when missing",()=>{expect(mapDocToUser({uid:"u1"}).assignedTrainerId).toBeUndefined();});
    it("should keep medicalProfile as undefined when missing",()=>{expect(mapDocToUser({uid:"u1"}).medicalProfile).toBeUndefined();});
    it("should keep timestamp fields as undefined when missing",()=>{const user=mapDocToUser({uid:"u1"});expect(user.lastActivityAt).toBeUndefined();expect(user.createdAt).toBeUndefined();expect(user.updatedAt).toBeUndefined();});


    it("should preserve Date objects in timestamp fields",()=>{const d=new Date("2024-01-01");const user=mapDocToUser({uid:"u1",createdAt:d,updatedAt:d,lastActivityAt:d});expect(user.createdAt).toBe(d);expect(user.updatedAt).toBe(d);expect(user.lastActivityAt).toBe(d);});
  });  describe("mapFirebaseUserToUser", () => {
    it("should merge Firebase Auth user and Firestore profile",()=>{const fb={uid:"fb-123",email:"u@c.app",displayName:"Display"};const profile={name:"Profile Name",role:"trainer",hasActiveAlert:true,assignedTrainerId:"t-1",medicalProfile:{allergies:[],injuries:[],conditions:[],goals:[],experience:"advanced",birthDate:null,height:175,initialWeight:75},lastActivityAt:new Date("2024-05-01"),createdAt:new Date("2024-01-15"),updatedAt:new Date("2024-05-20")};const user=mapFirebaseUserToUser(fb,profile);expect(user.uid).toBe("fb-123");expect(user.email).toBe("u@c.app");expect(user.name).toBe("Profile Name");expect(user.role).toBe("trainer");expect(user.hasActiveAlert).toBe(true);expect(user.assignedTrainerId).toBe("t-1");expect(user.medicalProfile).toEqual(profile.medicalProfile);expect(user.lastActivityAt).toEqual(profile.lastActivityAt);expect(user.createdAt).toEqual(profile.createdAt);expect(user.updatedAt).toEqual(profile.updatedAt);});
    it("should fallback to displayName",()=>{expect(mapFirebaseUserToUser({uid:"u",displayName:"Auth Name"},{}).name).toBe("Auth Name");});
    it("should fallback to Usuario when missing",()=>{expect(mapFirebaseUserToUser({uid:"u"},{}).name).toBe("Usuario");});
    it("should fallback to Usuario when displayName null",()=>{expect(mapFirebaseUserToUser({uid:"u",displayName:null},{}).name).toBe("Usuario");});
    it("should fallback email to empty when null",()=>{expect(mapFirebaseUserToUser({uid:"u",email:null},{}).email).toBe("");});
    it("should fallback email to empty when undefined",()=>{expect(mapFirebaseUserToUser({uid:"u"},{}).email).toBe("");});
    it("should default role to client",()=>{expect(mapFirebaseUserToUser({uid:"u"},{}).role).toBe("client");});
    it("should default hasActiveAlert to false",()=>{expect(mapFirebaseUserToUser({uid:"u"},{}).hasActiveAlert).toBe(false);});
    it("should set hasActiveAlert to false when null",()=>{expect(mapFirebaseUserToUser({uid:"u"},{hasActiveAlert:null}).hasActiveAlert).toBe(false);});
    it("should keep assignedTrainerId undefined",()=>{expect(mapFirebaseUserToUser({uid:"u"},{}).assignedTrainerId).toBeUndefined();});
    it("should keep medicalProfile undefined",()=>{expect(mapFirebaseUserToUser({uid:"u"},{}).medicalProfile).toBeUndefined();});
    it("should keep timestamp fields undefined",()=>{const user=mapFirebaseUserToUser({uid:"u"},{});expect(user.createdAt).toBeUndefined();expect(user.updatedAt).toBeUndefined();expect(user.lastActivityAt).toBeUndefined();});
    it("should handle empty profile",()=>{const user=mapFirebaseUserToUser({uid:"u",email:"x@y.com",displayName:"Name"},{});expect(user.uid).toBe("u");expect(user.email).toBe("x@y.com");expect(user.name).toBe("Name");expect(user.role).toBe("client");});


    it("should preserve Date objects",()=>{const d=new Date("2024-03-15");const user=mapFirebaseUserToUser({uid:"u"},{lastActivityAt:d,createdAt:d,updatedAt:d});expect(user.lastActivityAt).toBe(d);expect(user.createdAt).toBe(d);expect(user.updatedAt).toBe(d);});
  });
});

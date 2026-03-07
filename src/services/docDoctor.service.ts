import DocDoctor from "../models/doc_doctor";
import type { CreateDocDoctorInput, updateDocDoctorInput } from "../validators/docDoctor.schema";

export class DocDoctorService {
  async getDocDoctorsByUserId(userId: string) {
    return DocDoctor.find({ userId });
  }

  async getDocDoctorById(id: string) {
    return await DocDoctor.findById(id);
  }

  async createDocDoctor(userId: string, docDoctor: CreateDocDoctorInput) {
    return await DocDoctor.create({ ...docDoctor, userId });
  }

  async updateDocDoctor(id: string, docDoctor: updateDocDoctorInput) {
    return await DocDoctor.findByIdAndUpdate(id, docDoctor);
  }

  async updateDocDoctorByUser(userId: string, id: string, docDoctor: updateDocDoctorInput) {
    return await DocDoctor.findOneAndUpdate({ _id: id, userId }, docDoctor, {
      new: true,
    });
  }

  async deleteDocDoctor(userId: string, id: string) {
    return await DocDoctor.findByIdAndDelete(id);
  }

  async deleteDocDoctorByUser(userId: string, id: string) {
    return await DocDoctor.findOneAndDelete({ _id: id, userId });
  }
}

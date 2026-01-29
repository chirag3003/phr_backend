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

  async deleteDocDoctor(userId: string, id: string) {
    return await DocDoctor.findByIdAndDelete(id);
  }
}

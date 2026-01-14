import apiClient from "@/common/apiClient";

const uploadService = {
  uploadFile: async (file: File, folder: string = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await apiClient.post("/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // ResponseDTO<Map<String, String>> -> response.data is the DTO.
      // DTO has { success: true, data: { url: "..." }, message: "..." }
      if (response.data?.success) {
        return response.data.data.url;
      }
      throw new Error(response.data?.message || "Upload failed");
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },
};

export default uploadService;

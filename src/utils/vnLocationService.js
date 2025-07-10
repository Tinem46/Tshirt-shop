import axios from "axios";


const base = "https://provinces.open-api.vn/api";

export const getProvinces = () => axios.get(`${base}/p`);
export const getDistrictsByProvince = (provinceCode) => axios.get(`${base}/p/${provinceCode}?depth=2`);
export const getWardsByDistrict = (districtCode) => axios.get(`${base}/d/${districtCode}?depth=2`);
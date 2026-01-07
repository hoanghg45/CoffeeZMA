import { Banner } from "../types/banner";
import { pool } from "./db";

export const getBanners = async (): Promise<Banner[]> => {
    try {
        const { rows } = await pool.query(
            `SELECT 
        id, 
        image_url as "imageUrl", 
        title, 
        link, 
        display_order as "displayOrder", 
        is_active as "isActive" 
       FROM banners 
       WHERE is_active = true 
       ORDER BY display_order ASC`
        );
        return rows;
    } catch (error) {
        console.error("Error fetching banners:", error);
        return [];
    }
};

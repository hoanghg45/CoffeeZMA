import React, { FC, useEffect, useState } from "react";
import { Page, Header, Box, Text, useNavigate } from "zmp-ui";
import { getOrders } from "services/order";
import { Order } from "types/order";
import { ListRenderer } from "components/list-renderer";
import { ChevronRight, Package } from "lucide-react";
import { useRecoilValue } from "recoil";
import { userState } from "state";

const OrderHistoryPage: FC = () => {
    const user = useRecoilValue(userState);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user.id) return;
            try {
                const data = await getOrders(user.id);
                setOrders(data);
            } catch (error) {
                console.error("Failed to load orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED": return "text-green-600";
            case "CANCELLED": return "text-red-500";
            case "DELIVERING": return "text-blue-500";
            default: return "text-yellow-600";
        }
    };

    const getStatusText = (status: string) => {
        // A simple mapper, can be moved to utils
        const map: Record<string, string> = {
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đã xác nhận",
            PREPARING: "Đang chuẩn bị",
            DELIVERING: "Đang giao",
            COMPLETED: "Hoàn thành",
            CANCELLED: "Đã hủy",
            RETURNED: "Trả hàng"
        };
        return map[status] || status;
    };

    return (
        <Page className="bg-gray-100 min-h-screen">
            <Header title="Lịch sử đơn hàng" showBackIcon={true} />

            <Box className="p-4 space-y-4">
                {loading ? (
                    <Text className="text-center text-gray-400 mt-10">Đang tải...</Text>
                ) : orders.length === 0 ? (
                    <Box className="flex flex-col items-center justify-center mt-20 space-y-4">
                        <Package size={48} className="text-gray-300" />
                        <Text className="text-gray-500">Bạn chưa có đơn hàng nào</Text>
                    </Box>
                ) : (
                    orders.map((order) => (
                        <Box
                            key={order.id}
                            className="bg-white rounded-xl p-4 shadow-sm active:opacity-70 transition-opacity"
                            onClick={() => navigate(`/order-status?id=${order.id}`)}
                        >
                            <Box flex justifyContent="space-between" alignItems="center" className="mb-2">
                                <Text.Header className="font-bold text-base">
                                    #{order.id}
                                </Text.Header>
                                <Text size="small" className={`font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                </Text>
                            </Box>

                            <Box className="space-y-1 mb-3">
                                <Text size="xSmall" className="text-gray-500">
                                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                                </Text>
                                <Text size="small" className="text-gray-600 line-clamp-1">
                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                                </Text>
                            </Box>

                            <div className="h-[1px] bg-gray-100 my-2" />

                            <Box flex justifyContent="space-between" alignItems="center">
                                <Text size="small" className="text-gray-500">Tổng cộng</Text>
                                <Text.Header className="text-base text-primary">
                                    {order.total.toLocaleString()}đ
                                </Text.Header>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>
        </Page>
    );
};

export default OrderHistoryPage;

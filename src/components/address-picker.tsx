import React, { FC, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Box, Button, Icon, Input, Sheet, Text, useNavigate } from "zmp-ui";
import { selectedAddressState, userAddressesState, userState } from "../state";
import { saveUserAddress, UserAddress } from "../services/user";
import { getLocation } from "zmp-sdk";

export const AddressPicker: FC = () => {
  const [visible, setVisible] = useState(false);
  const addresses = useRecoilValue(userAddressesState); // Read-only
  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);
  const [isEditing, setIsEditing] = useState(false);
  const user = useRecoilValue(userState);

  // Form State
  const [form, setForm] = useState<Partial<UserAddress>>({
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [addresses]);

  const handleSave = async () => {
    if (!form.name || !form.address || !form.phone) return;
    
    const newAddress = await saveUserAddress({
      userId: user.id,
      name: form.name,
      address: form.address,
      lat: form.lat || 0,
      long: form.long || 0,
      phone: form.phone,
      isDefault: addresses.length === 0
    });

    if (newAddress) {
      // Optimistic update or refetch
      // For simplicity, we'll just close and let state refresh on next mount or use a refresher
      setIsEditing(false);
      setVisible(false);
      // In a real app, force refresh atoms here
      setSelectedAddress(newAddress);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      const { latitude, longitude } = await getLocation({});
      // Mock reverse geocoding for demo
      setForm(prev => ({
        ...prev,
        lat: parseFloat(latitude || "0"),
        long: parseFloat(longitude || "0"),
        address: `Lat: ${latitude}, Long: ${longitude}` // Should use an API to get address string
      }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Box
        className="flex items-center active:opacity-80"
        onClick={() => setVisible(true)}
      >
        <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
          <Icon icon="zi-location" className="text-yellow-600" size={20} />
        </Box>
        <Box className="flex-1">
          <Text.Title size="small" className="font-bold">{selectedAddress?.name || "Chọn địa chỉ"}</Text.Title>
          <Text size="xSmall" className="text-gray-500 truncate">
            {selectedAddress?.address || "Vui lòng chọn địa chỉ giao hàng"}
          </Text> 
        </Box>
        <Icon icon="zi-chevron-right" size={20} className="text-gray-400 ml-2" />
      </Box>

      <Sheet
        visible={visible}
        onClose={() => setVisible(false)}
        mask
        swipeToClose
        height="auto"
      >
        <Box className="p-4 space-y-4 pb-8">
          <Box className="flex justify-between items-center">
            <Text.Title>Sổ địa chỉ</Text.Title>
            <Button 
              size="small" 
              icon={<Icon icon="zi-plus" />} 
              onClick={() => { setIsEditing(true); setForm({}); }}
            >
              Thêm mới
            </Button>
          </Box>

          <Box className="space-y-2 max-h-[50vh] overflow-y-auto">
            {addresses.map((addr) => (
              <Box
                key={addr.id}
                className={`p-3 rounded-lg border ${selectedAddress?.id === addr.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => {
                  setSelectedAddress(addr);
                  setVisible(false);
                }}
              >
                <Box className="flex justify-between">
                  <Text.Title size="small">{addr.name}</Text.Title>
                  {addr.isDefault && <Text size="xxxxSmall" className="text-green-600 bg-green-100 px-1 rounded">Mặc định</Text>}
                </Box>
                <Text size="xSmall" className="text-gray-500">{addr.address}</Text>
                <Text size="xSmall" className="text-gray-500">{addr.phone}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Sheet>

      {/* Add/Edit Sheet */}
      <Sheet
        visible={isEditing}
        onClose={() => setIsEditing(false)}
        mask
        swipeToClose
      >
        <Box className="p-4 space-y-4 pb-8">
          <Text.Title>Thêm địa chỉ mới</Text.Title>
          
          <Input 
            label="Tên gợi nhớ (Nhà, Cty)" 
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
          />
          
          <Box className="flex space-x-2">
            <Input 
              className="flex-1"
              label="Địa chỉ" 
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
            />
            <Button 
              variant="secondary" 
              icon={<Icon icon="zi-location" />}
              onClick={handleGetCurrentLocation}
            />
          </Box>

          <Input 
            label="Số điện thoại nhận hàng" 
            value={form.phone}
            onChange={(e) => setForm({...form, phone: e.target.value})}
          />

          <Button fullWidth onClick={handleSave}>Lưu địa chỉ</Button>
        </Box>
      </Sheet>
    </>
  );
};


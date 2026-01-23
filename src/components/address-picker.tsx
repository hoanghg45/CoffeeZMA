import React, { FC, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useRecoilRefresher_UNSTABLE } from "recoil";
import { Box, Button, Input, Text } from "zmp-ui";
import { MapPin, ChevronRight, Plus, Edit, Trash2, X, Bookmark } from "lucide-react";
import { formatPhoneNumber } from "utils/phone";
import { Sheet } from "./fullscreen-sheet";
import { createPortal } from "react-dom";
import { selectedAddressState, userAddressesState, userState, addressPickerVisibleState, addressEditingState } from "../state";
import { saveCustomerAddress, deleteCustomerAddress, CustomerAddress } from "../services/customer";
import { getCurrentLocation } from "../services/location";

interface AddressPickerProps {
  hideIcon?: boolean;
  hideChevron?: boolean;
}

export const AddressPicker: FC<AddressPickerProps> = ({ hideIcon = false, hideChevron = false }) => {
  const [visible, setVisible] = useRecoilState(addressPickerVisibleState);
  const addresses = useRecoilValue(userAddressesState); // Read-only
  const refreshAddresses = useRecoilRefresher_UNSTABLE(userAddressesState);
  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);
  const [isEditing, setIsEditing] = useRecoilState(addressEditingState);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const user = useRecoilValue(userState);

  // Form State
  const [form, setForm] = useState<Partial<CustomerAddress>>({
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
    if (!form.name || !form.address) return;

    const savedAddress = await saveCustomerAddress({
      id: editingAddress?.id,
      customerId: user.id, // User ID here is the Zalo/Customer ID
      name: form.name,
      address: form.address,
      lat: form.lat || editingAddress?.lat || 0,
      long: form.long || editingAddress?.long || 0,
      phone: form.phone || "",
      isDefault: editingAddress?.isDefault || (addresses.length === 0 && !editingAddress)
    });

    if (savedAddress) {
      setIsEditing(false);
      setEditingAddress(null);
      setForm({ name: "", address: "", phone: "" });
      refreshAddresses();

      // Update selected address if it was edited or if it's new
      if (editingAddress?.id === selectedAddress?.id || !selectedAddress) {
        setSelectedAddress(savedAddress);
      }

      if (!editingAddress) {
        setVisible(false);
      }
    }
  };

  const handleEdit = (addr: CustomerAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setForm({
      name: addr.name,
      address: addr.address,
      phone: addr.phone,
      lat: addr.lat,
      long: addr.long,
    });
    setIsEditing(true);
  };

  const handleDelete = async (addressId: string) => {
    const success = await deleteCustomerAddress(addressId, user.id);
    if (success) {
      // If deleted address was selected, clear selection
      // The useEffect will handle selecting a new default address after refresh
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(null);
      }

      refreshAddresses();
      setDeleteConfirmId(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingAddress(null);
    setForm({ name: "", address: "", phone: "" });
  };

  const handleGetCurrentLocation = async () => {
    try {
      // Get location coordinates using Zalo's token-based flow
      const coordinates = await getCurrentLocation();

      if (!coordinates) {
        console.warn("Location not available. Please ensure location permission is granted.");
        // Optionally show a toast notification to user
        return;
      }

      const { latitude, longitude } = coordinates;

      if (isNaN(latitude) || isNaN(longitude)) {
        console.warn("Invalid coordinates");
        return;
      }


      // Set coordinates and try to reverse geocode
      let addressText = `Vị trí hiện tại: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      try {
        const { reverseGeocode } = await import("../services/mapbox");
        const geocodedAddress = await reverseGeocode(latitude, longitude);
        if (geocodedAddress) {
          addressText = geocodedAddress;
        }
      } catch (err) {
        console.error("Failed to reverse geocode:", err);
      }

      setForm(prev => ({
        ...prev,
        lat: latitude,
        long: longitude,
        address: addressText
      }));
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  return (
    <>
      <Box
        className="flex items-center active:opacity-80"
        onClick={() => setVisible(true)}
      >
        {!hideIcon && (
          <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
            <MapPin className="text-yellow-600" size={20} />
          </Box>
        )}
        <Box className="flex-1 min-w-0">
          <Text.Title size="small" className="font-bold truncate">{selectedAddress?.name || "Chọn địa chỉ"}</Text.Title>
          <Text size="xSmall" className="text-gray-500 line-clamp-2 break-words">
            {selectedAddress?.address || "Vui lòng chọn địa chỉ giao hàng"}
          </Text>
        </Box>
        {!hideChevron && (
          <ChevronRight size={20} className="text-gray-400 ml-2" />
        )}
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
              variant="primary"
              onClick={() => {
                setIsEditing(true);
                setEditingAddress(null);
                setForm({ name: "", address: "", phone: "" });
              }}
              className="rounded-lg flex items-center justify-center p-0 w-9 h-9"
            >
              <Plus size={20} className="flex-shrink-0" />
            </Button>
          </Box>

          <Box className="space-y-3 max-h-[50vh] overflow-y-auto">
            {addresses.length === 0 ? (
              <Box className="text-center py-8">
                <MapPin size={48} className="text-gray-300 mx-auto mb-3" />
                <Text size="small" className="text-gray-500">Chưa có địa chỉ nào</Text>
              </Box>
            ) : (
              addresses.map((addr) => (
                <Box
                  key={addr.id}
                  className={`relative p-4 rounded-xl border transition-all ${selectedAddress?.id === addr.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <Box className="flex items-start gap-3">
                    <Box
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        setSelectedAddress(addr);
                        setVisible(false);
                      }}
                    >
                      <Box className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedAddress?.id === addr.id
                        ? 'bg-primary'
                        : 'bg-gray-100'
                        }`}>
                        <MapPin
                          className={selectedAddress?.id === addr.id ? 'text-white' : 'text-gray-600'}
                          size={20}
                        />
                      </Box>
                      <Box className="flex-1 min-w-0">
                        <Box className="flex items-center gap-2 mb-1">
                          <Text.Title size="small" className="font-semibold">{addr.name}</Text.Title>
                          {addr.isDefault && (
                            <Box className="px-2 py-0.5 bg-primary/10 rounded-full">
                              <Text size="xxxxSmall" className="text-primary font-medium">Mặc định</Text>
                            </Box>
                          )}
                        </Box>
                        <Text size="xSmall" className="text-gray-600 mb-1 line-clamp-2">{addr.address}</Text>

                      </Box>
                    </Box>

                    {/* Action Buttons - Compact vertical stack on the right */}
                    <Box className="flex flex-col gap-1.5 flex-shrink-0">
                      <Button
                        variant="tertiary"
                        size="small"
                        className="w-9 h-9 p-0 rounded-full bg-green-50 hover:bg-green-100 active:bg-green-200"
                        onClick={(e) => handleEdit(addr, e)}
                      >
                        <Edit size={18} className="text-green-600" />
                      </Button>
                      <Button
                        variant="tertiary"
                        size="small"
                        className="w-9 h-9 p-0 rounded-full bg-red-50 hover:bg-red-100 active:bg-red-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(addr.id);
                        }}
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Sheet>

      {/* Add/Edit Sheet - Apple Human Design */}
      {createPortal(
        <Sheet
          visible={isEditing}
          onClose={handleCancelEdit}
          autoHeight={true}
          mask
          handler
          swipeToClose
        >
          <Box className="flex flex-col bg-surface rounded-t-xl overflow-hidden relative">
            {/* Close Button - Absolute Top Right */}
            <div
              className="absolute top-3 right-3 z-50 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm cursor-pointer active:opacity-70 transition-opacity"
              onClick={handleCancelEdit}
            >
              <X className="text-gray-600" size={24} />
            </div>

            {/* Content Area - Compact */}
            <Box className="px-4 pt-4 pb-3">
              {/* Header */}
              <Box className="pb-3 mb-3 border-b border-gray-100">
                <Text.Title size="normal" className="font-bold text-gray-900">
                  {editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                </Text.Title>
              </Box>

              {/* Form Fields - Compact Card Style */}
              <Box className="space-y-2">
                {/* Name Field */}
                <Box className="bg-white rounded-xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <Box className="flex items-center space-x-3">
                    <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Bookmark className="text-yellow-600" size={18} />
                    </Box>
                    <Box className="flex-1 min-w-0">
                      <Text size="xSmall" className="text-gray-500 mb-0.5">Tên gợi nhớ</Text>
                      <Input
                        value={form.name || ""}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ví dụ: Nhà, Công ty"
                        className="border-none px-0 bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none p-0 h-auto"
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Address Field */}
                <Box className="bg-white rounded-xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <Box className="flex items-center space-x-3">
                    <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-yellow-600" size={18} />
                    </Box>
                    <Box className="flex-1 min-w-0">
                      <Box className="flex items-center justify-between mb-0.5">
                        <Text size="xSmall" className="text-gray-500">Địa chỉ</Text>
                        <Box
                          className="w-6 h-6 flex items-center justify-center active:opacity-50 cursor-pointer"
                          onClick={handleGetCurrentLocation}
                        >
                          <MapPin size={16} className="text-gray-400" />
                        </Box>
                      </Box>
                      <Input
                        value={form.address || ""}
                        onChange={(e) => setForm({ ...form, address: e.target.value, lat: 0, long: 0 })}
                        placeholder="Nhập địa chỉ chi tiết"
                        className="border-none px-0 bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none p-0 h-auto"
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Phone Field */}

              </Box>
            </Box>

            {/* Sticky Footer Action Bar - Compact */}
            <Box className="flex-none px-4 pt-3 pb-4 bg-surface border-t border-divider shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
              <Box flex className="gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleCancelEdit}
                  className="rounded-full h-11 text-sm font-semibold"
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  type="highlight"
                  fullWidth
                  onClick={handleSave}
                  disabled={!form.name || !form.address}
                  className="rounded-full h-11 text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingAddress ? "Cập nhật" : "Lưu địa chỉ"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Sheet>,
        document.body,
      )}

      {/* Delete Confirmation Sheet */}
      <Sheet
        visible={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        mask
        swipeToClose
        height="auto"
      >
        <Box className="p-6 space-y-4">
          <Box className="text-center">
            <Box className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-error" />
            </Box>
            <Text.Title size="large" className="mb-2">Xóa địa chỉ?</Text.Title>
            <Text size="small" className="text-gray-600">
              Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
            </Text>
          </Box>

          <Box className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setDeleteConfirmId(null)}
              className="rounded-lg h-12"
            >
              Hủy
            </Button>
            <Button
              fullWidth
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="rounded-lg h-12 font-semibold bg-error text-white"
            >
              Xóa
            </Button>
          </Box>
        </Box>
      </Sheet>
    </>
  );
};

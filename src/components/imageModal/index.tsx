import { Modal, Button } from 'antd';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import React from 'react';
import './index.scss';
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  selectedIndex: number;
  onChangeImage: (direction: "left" | "right") => void;
}

const index = ({ isOpen, onClose, images, selectedIndex, onChangeImage }: ImageModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      closeIcon={<CloseOutlined style={{ color: 'white', fontSize: '24px' }} />}
      className="image-modal"
    >
      <div className="modal-content">
        <Button 
          className="nav-button left" 
          icon={<LeftOutlined />}
          onClick={() => onChangeImage("left")}
        />

        <div className="image-container">
          <img src={images[selectedIndex]} alt="Zoomed Product" />
        </div>

        <Button 
          className="nav-button right" 
          icon={<RightOutlined />}
          onClick={() => onChangeImage("right")}
        />
      </div>
    </Modal>
  );
};
export default index;
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, Row, Col, Radio } from "antd";
import {areaMap,prefectureMap} from "../../utils/prefecture";

const { Option } = Select;


interface EventSearchFormProps {
  onSearch: (values: any) => void;
  initialValues?: Partial<{
    keyword: string;
    year: string;
    month: string;
    day: string;
    area_id: string;
    prefecture_id: string;
  }>;
}

const EventSearchForm: React.FC<EventSearchFormProps> = ({ onSearch, initialValues }) => {
  const [regionType, setRegionType] = useState<'area' | 'prefecture' | null>(() => {
    if (initialValues?.area_id) return 'area';
    if (initialValues?.prefecture_id) return 'prefecture';
    return null;
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        keyword: initialValues.keyword,
        year: initialValues.year,
        month: initialValues.month,
        day: initialValues.day,
        area: initialValues.area_id,
        prefecture: initialValues.prefecture_id,
      });
    }
  }, [initialValues, form]);

  const handleRegionChange = (type: 'area' | 'prefecture') => {
    setRegionType(type);
    form.setFieldsValue({ area: undefined, prefecture: undefined });
  };

  const handleFinish = (values: any) => {
    // 只允许提交一个地域值
    if (regionType === 'area') {
      values.prefecture = undefined;
    } else if (regionType === 'prefecture') {
      values.area = undefined;
    }
    onSearch(values);
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      variant="filled"
      size="large"
      onFinish={handleFinish}
    >
      <Row gutter={16} align="middle">
        <Col span={24} style={{ marginBottom: 16 }}>
          <Form.Item name="keyword" label="关键词" style={{ marginBottom: 0 }}>
            <Input placeholder="声优、偶像、艺人名等" allowClear />
          </Form.Item>
        </Col>
        <Col span={24} style={{ marginBottom: 16 }}>
          <Form.Item label="举办日" style={{ marginBottom: 0 }}>
            <Input.Group compact>
              <Form.Item name="year" noStyle>
                <Select placeholder="年" style={{ width: 100 }} allowClear>
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    const years = [];
                    for (let y = currentYear + 1; y >= 1980; y--) {
                      years.push(y);
                    }
                    return years.map(year => (
                      <Option key={year} value={year}>{year}年</Option>
                    ));
                  })()}
                </Select>
              </Form.Item>
              <Form.Item name="month" noStyle>
                <Select placeholder="月" style={{ width: 80, marginLeft: 8 }} allowClear>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <Option key={month} value={month}>{month}月</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="day" noStyle>
                <Select placeholder="日" style={{ width: 80, marginLeft: 8 }} allowClear>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <Option key={day} value={day}>{day}日</Option>
                  ))}
                </Select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col span={24} style={{ marginBottom: 16 }}>
          <Form.Item label="举办地域" style={{ marginBottom: 0 }}>
            <Radio.Group
              onChange={e => handleRegionChange(e.target.value)}
              value={regionType}
              style={{ marginRight: 16 }}
            >
              <Radio value="area">地域</Radio>
              <Radio value="prefecture">都道府县</Radio>
            </Radio.Group>
            {regionType === 'area' && (
              <Form.Item name="area" noStyle>
                <Select placeholder="请选择地域" style={{ width: 200 }} allowClear>
                  {Object.entries(areaMap).map(([id, name]) => (
                    <Option key={id} value={id}>{name}</Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {regionType === 'prefecture' && (
              <Form.Item name="prefecture" noStyle>
                <Select placeholder="请选择都道府县" style={{ width: 200 }} allowClear>
                  {Object.entries(prefectureMap).map(([id, name]) => (
                    <Option key={id} value={id}>{name}</Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </Form.Item>
        </Col>
        <Col span={24} style={{ textAlign: 'left' }}>
          <Button type="primary" htmlType="submit" style={{ minWidth: 120 }}>
            搜索活动
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default EventSearchForm;

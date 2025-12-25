import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Button, 
  Popover, 
  Form, 
  Transfer, 
  List, 
  Space, 
  theme as antTheme, 
  Typography,
  message
} from 'antd';
import { SettingOutlined, HolderOutlined, SaveOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { EventData } from "../../utils/events/eventdata"; // 引用你原本的类型定义
import { EventCard } from "../event/EventCard"; // 引用你原本的EventCard

const { useToken } = antTheme;

// --- 1. 拖拽项封装组件 ---
interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative' as const, // 修正类型
  };

  // 这里为了遵循“不用原生组件”原则，虽然ref必须挂载在DOM上，
  // 但我们在视觉上完全不引入额外的原生样式div，仅作为功能性包裹
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
       {/* 添加一个拖拽手柄图标增强可用性，或者直接点击整个卡片拖拽 */}
      {children}
    </div>
  );
};

// --- 2. 主业务组件 ---
interface AnnualBestEventsProps {
  allEvents: EventData[]; // 传入当年的所有活动
}

export const AnnualBestEvents: React.FC<AnnualBestEventsProps> = ({ allEvents }) => {
  const { token } = useToken();
  const [form] = Form.useForm();
  
  // 状态：当前选定并展示的活动列表（有序）
  const [displayEvents, setDisplayEvents] = useState<EventData[]>([]);
  // 状态：Popover 是否打开
  const [open, setOpen] = useState(false);

  // 穿梭框的数据源处理
  const transferDataSource = useMemo(() => {
    return allEvents.map(e => ({
      key: e.id,
      title: `${e.date} ${e.title}`, // 显示日期和名称方便查找
      description: e.venue?.name,
      disabled: false,
    }));
  }, [allEvents]);

  // 拖拽传感器设置 (避免与点击事件冲突)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动 8px 后才触发拖拽，防止误触点击
      },
    })
  );

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setDisplayEvents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 处理表单提交（从 Popover 选完后点击保存）
  const handleFinish = (values: { selectedKeys: string[] }) => {
    const selectedKeys = values.selectedKeys || [];
    
    // 核心逻辑：合并新旧选择，并保持原有顺序
    const newDisplayList = [...displayEvents];

    // 1. 移除已经被取消选择的
    const currentIds = new Set(selectedKeys);
    const filteredList = newDisplayList.filter(item => currentIds.has(item.id));

    // 2. 添加新选择的 (追加到末尾)
    const existingIds = new Set(filteredList.map(e => e.id));
    const newItems = allEvents.filter(e => currentIds.has(e.id) && !existingIds.has(e.id));
    
    const finalList = [...filteredList, ...newItems];

    setDisplayEvents(finalList);
    setOpen(false);
    message.success(`已更新年度活动清单，共 ${finalList.length} 个`);
  };

  // 渲染 Popover 内容
  const popoverContent = (
    <Form
      form={form}
      onFinish={handleFinish}
      layout="vertical"
      initialValues={{ selectedKeys: displayEvents.map(e => e.id) }}
      style={{ minWidth: 500 }} // 保证穿梭框宽度
    >
      <Form.Item
        name="selectedKeys"
        label="勾选你想展示的活动（支持搜索）"
        valuePropName="targetKeys"
      >
        <Transfer
          dataSource={transferDataSource}
          showSearch
          filterOption={(inputValue, item) =>
            item.title!.indexOf(inputValue) !== -1 || item.description?.indexOf(inputValue) !== -1
          }
          targetKeys={Form.useWatch('selectedKeys', form)}
          onChange={(nextTargetKeys) => {
             form.setFieldValue('selectedKeys', nextTargetKeys);
          }}
          render={(item) => item.title!}
          listStyle={{
            width: 220,
            height: 300,
          }}
          titles={['待选活动', '已选展示']}
        />
      </Form.Item>
      <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => setOpen(false)}>取消</Button>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
          确认并展示
        </Button>
      </Space>
    </Form>
  );

  return (
    <Card
      title={<Space><Typography.Text strong>年度活动</Typography.Text><Typography.Text type="secondary" style={{fontSize: 12}}>({displayEvents.length})</Typography.Text></Space>}
      extra={
        <Popover
          content={popoverContent}
          title="编辑年度活动列表"
          trigger="click"
          open={open}
          onOpenChange={(v) => {
             setOpen(v);
             // 每次打开时重置表单为当前展示状态
             if(v) form.setFieldsValue({ selectedKeys: displayEvents.map(e => e.id) });
          }}
          placement="bottomRight"
          overlayStyle={{ width: 600 }}
        >
          <Button type="text" icon={<SettingOutlined />}>管理 / 排序</Button>
        </Popover>
      }
      style={{ marginTop: 16 }}
      bodyStyle={{ padding: '24px 12px' }}
    >
      {displayEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextTertiary }}>
          点击右上角按钮，挑选你今年最难忘的现场回忆吧！
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={displayEvents.map(e => e.id)} 
            strategy={rectSortingStrategy} // 使用矩形策略支持栅格拖拽
          >
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
              dataSource={displayEvents}
              renderItem={(event) => (
                <List.Item style={{ marginBottom: 16 }}>
                  <SortableItem id={event.id}>
                    {/* 头部添加一个明显的拖拽把手或者提示 */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ 
                            position: 'absolute', 
                            top: -10, 
                            right: -10, 
                            zIndex: 10, 
                            padding: 4,
                            cursor: 'grab',
                            background: token.colorBgContainer,
                            borderRadius: '50%',
                            boxShadow: token.boxShadowSecondary
                        }}>
                             <HolderOutlined style={{ color: token.colorTextSecondary }} />
                        </div>
                        <EventCard event={event} isDark={false} />
                    </div>
                  </SortableItem>
                </List.Item>
              )}
            />
          </SortableContext>
        </DndContext>
      )}
    </Card>
  );
};
import React, { useMemo } from 'react';
import { Card, Col, Empty, Row, Typography } from 'antd';
import { useWSInfo } from '../WSInfo';
import './index.less';
import { FeatureItem } from './FeatureItem';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const SystemPanel = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'system' });
  const { systemMsg } = useWSInfo();
  const { features, system } = systemMsg[0] || {};
  const noSupport = useMemo(() => {
    if (!features) return [];
    return Object.values(features).reduce((acc, cur) => {
      cur.forEach((item) => {
        if (!item.supported) {
          acc.push(item);
        }
      });
      return acc;
    }, []);
  }, [features]);

  if (systemMsg.length === 0) {
    return <Empty description={false} />;
  }
  return (
    <div className="system-panel">
      <div className="system-info">
        <Title level={5}>{t('dashboard')}</Title>
        <Card>
          <Row>
            <Col span={18}>
              <Row>
                <Col span={5} className="system-info__label">
                  OS:
                </Col>
                <Col className="system-info__value">{system.os}</Col>
              </Row>
              <Row>
                <Col span={5} className="system-info__label">
                  Browser:
                </Col>
                <Col className="system-info__value">{system.browser}</Col>
              </Row>
              <Row wrap={false}>
                <Col span={5} className="system-info__label">
                  User Agent:
                </Col>
                <Col className="system-info__value">{system.ua}</Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </div>
      <div className="system-info">
        <Title level={5} style={{ color: 'rgb(216, 30, 6)' }}>
          😭 <span>{t('unsupport')}</span>
        </Title>
        <Card
          style={{
            borderColor: 'rgb(216, 30, 6)',
            backgroundColor: 'rgba(216, 30, 6, 0.1)',
          }}
        >
          <Row>
            {noSupport.map((feature) => (
              <Col span={8} key={feature.title}>
                <FeatureItem {...feature} />
              </Col>
            ))}
          </Row>
        </Card>
      </div>
      {Object.entries(features).map(([key, value]) => {
        return (
          <div className="system-info" key={key}>
            <Title level={5}>{key}</Title>
            <Card>
              <Row>
                {value.map((feature) => (
                  <Col span={8} key={feature.title}>
                    <FeatureItem {...feature} />
                  </Col>
                ))}
              </Row>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default SystemPanel;

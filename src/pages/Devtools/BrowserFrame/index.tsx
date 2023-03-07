import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import React, { useState } from 'react';
import Icon from '@ant-design/icons';
import { ReactComponent as CellularSVG } from '@/assets/image/cellular.svg';
import { ReactComponent as BatterySVG } from '@/assets/image/battery.svg';
import './index.less';
import { Button, Space, Spin } from 'antd';
import { useWSInfo } from '../WSInfo';
import { ElementPanel } from '../ElementPanel';
import { useTranslation } from 'react-i18next';

function getTime() {
  const date = new Date();
  let hours = String(date.getHours());
  hours = Number(hours) >= 10 ? hours : `0${hours}`;
  let mins = String(date.getMinutes());
  mins = Number(mins) >= 10 ? mins : `0${mins}`;
  return [hours, mins].join(':');
}

interface FrameWrapperProps {
  os?: 'IOS' | 'Android';
  loading: boolean;
  onRefresh: () => void;
}

export const PCFrame = ({
  children,
  loading,
  onRefresh,
}: PropsWithChildren<FrameWrapperProps>) => {
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });
  const { t } = useTranslation('translation', { keyPrefix: 'page' });
  const { pageMsg, refresh } = useWSInfo();
  const [elementVisible, setElementVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const utilsRef = useRef<HTMLDivElement | null>(null);
  const xAxisRef = useRef(0);
  const [width, setWidth] = useState<string | number>('40%');
  useEffect(() => {
    if (!elementVisible) {
      return;
    }
    const clientIframe = document.querySelector(
      '.client-iframe',
    ) as HTMLIFrameElement;
    const containerArea = containerRef.current;
    const dividerLine = dividerRef.current;
    const utilsArea = utilsRef.current;
    let rightWidth = 0;
    let containerWidth = 0;
    let MAX_SIZE = 0;
    let MIN_SIZE = 0;
    function start(e: MouseEvent) {
      e.preventDefault();
      // `mousemove` not working when meet iframe
      clientIframe.style.pointerEvents = 'none';
      containerWidth = containerArea?.getBoundingClientRect().width || 0;
      MAX_SIZE = containerWidth * 0.8;
      MIN_SIZE = containerWidth * 0.2;
      rightWidth = utilsArea?.getBoundingClientRect().width || 0;
      const { clientX } = e;
      xAxisRef.current = clientX;
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end);
    }
    function move(e: MouseEvent) {
      e.preventDefault();
      const { clientX } = e;
      const diffX = Number(
        (rightWidth - (clientX - xAxisRef.current)).toFixed(2),
      );
      if (diffX > MAX_SIZE || diffX < MIN_SIZE) return;
      setWidth(diffX);
    }
    function end() {
      xAxisRef.current = 0;
      // reset `pointEvents` when mouse up
      clientIframe.style.pointerEvents = 'auto';
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
    }
    dividerLine?.addEventListener('mousedown', start);
    // eslint-disable-next-line consistent-return
    return () => {
      dividerLine?.removeEventListener('mousedown', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
    };
  }, [elementVisible]);
  return (
    <div className="pc-frame" ref={containerRef}>
      <div className="pc-frame__top">
        <div className="pc-frame__top-left">
          <Space>
            <div className="function-circle close" />
            <div className="function-circle mini" />
            <div className="function-circle fullscreen" />
          </Space>
        </div>
        <div className="pc-frame__top-right">
          <Space>
            <Button
              onClick={() => {
                onRefresh();
                refresh('page');
              }}
            >
              {ct('refresh')}
            </Button>
            <Button
              onClick={() => {
                setElementVisible(!elementVisible);
              }}
            >
              {t('element')}
            </Button>
          </Space>
        </div>
      </div>
      <div className="pc-frame__body spin-container">
        <Spin spinning={loading} className="spin-controller" />
        <div className="pc-frame__body-content">{children}</div>
        {elementVisible && (
          <>
            <div className="pc-frame__body-divider" ref={dividerRef} />
            <div
              className="pc-frame__body-utils"
              ref={utilsRef}
              style={{ width }}
            >
              <div>
                <ElementPanel html={pageMsg[0].html} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const IOSFrame = ({ children }: PropsWithChildren<unknown>) => {
  const time = getTime();
  return (
    <div className="ios-frame">
      <div className="ios-frame__top">
        <p className="ios-frame__top-left">{time}</p>
        <p className="ios-frame__top-hair">
          <p className="ios-frame__top-forehead" />
        </p>
        <p className="ios-frame__top-right">
          <Icon component={CellularSVG} />
          <Icon component={BatterySVG} className="ios-battery" />
        </p>
      </div>
      <div className="ios-frame__content">{children}</div>
      <div className="ios-frame__bottom">
        <div className="ios-home" />
      </div>
    </div>
  );
};

const AndroidFrame = ({ children }: PropsWithChildren<unknown>) => {
  const time = getTime();
  return (
    <div className="android-frame">
      <div className="android-frame__camera" />
      <div className="android-frame__top">
        <p className="android-frame__top-left">{time}</p>
        <p className="android-frame__top-right">
          <Icon component={CellularSVG} />
          <Icon component={BatterySVG} className="android-battery" />
        </p>
      </div>
      <div className="android-frame__content">{children}</div>
      <div className="android-frame__bottom">
        <div className="android-home" />
      </div>
    </div>
  );
};

export const MobileFrame = ({
  os,
  children,
  loading,
  onRefresh,
}: PropsWithChildren<FrameWrapperProps>) => {
  const { pageMsg, refresh } = useWSInfo();
  const PhoneFrame = os === 'IOS' ? IOSFrame : AndroidFrame;
  return (
    <div className="mobile-frame">
      <div className="mobile-frame__left spin-container">
        <Spin spinning={loading} className="spin-controller" />
        <PhoneFrame>{children}</PhoneFrame>
      </div>
      <div className="mobile-frame__middle">
        <Space direction="vertical">
          <Button
            style={{ position: 'relative', zIndex: 10 }}
            onClick={() => {
              onRefresh();
              refresh('page');
            }}
          >
            Refresh
          </Button>
        </Space>
      </div>
      <div className="mobile-frame__right spin-container">
        <Spin spinning={loading} className="spin-controller" />
        <ElementPanel html={pageMsg[0].html} />
      </div>
    </div>
  );
};

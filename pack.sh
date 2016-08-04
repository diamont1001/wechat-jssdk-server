#!/bin/sh
rm -rf release
mkdir release
current_tag=$1
pack_time=`date -d now +'%Y%m%d%H%M'`
pack_name="wechat-jssdk-server-"$current_tag"-"$pack_time"-bin"
tar --exclude ./release -cvf ./release/$pack_name.tgz ./*
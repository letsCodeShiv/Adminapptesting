import React, { useEffect, useState, useContext } from "react";
import { Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import { ApiConfig } from "config/ApiConfig";
import FirstCard from "./FirstCard";
import SecondCard from "./SecondCard";
import ThirdCard from "./ThirdCard";
import FalconComponentCard from "components/common/FalconComponentCard";
import { FilterProvider } from "context/Filter";
import { MultiSelect } from "primereact/multiselect";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "./main.css";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import subDays from "date-fns/subDays";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import addDays from "date-fns/addDays";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import addMonths from "date-fns/addMonths";
import { startOfYear, endOfDay, startOfDay } from "date-fns";
import { toast } from "react-toastify";
import { DateRangeContext } from "context/DatePickerContext";
import { ClickedValueContext } from "context/tableAgentContext";
import Loader from "components/Loader/Loader";
import { Tooltip as ReactTooltip } from "react-tooltip";

const { afterToday } = DateRangePicker;

const predefinedRanges = [
  {
    label: "Today",
    value: [new Date(), new Date()],
    placement: "left",
  },
  {
    label: "Yesterday",
    value: [addDays(new Date(), -1), addDays(new Date(), -1)],
    placement: "left",
  },
  {
    label: "This week",
    value: [startOfWeek(new Date()), endOfWeek(new Date())],
    placement: "left",
  },
  {
    label: "Last 7 days",
    value: [subDays(new Date(), 6), new Date()],
    placement: "left",
  },
  {
    label: "Last 30 days",
    value: [subDays(new Date(), 29), new Date()],
    placement: "left",
  },
  {
    label: "This month",
    value: [startOfMonth(new Date()), new Date()],
    placement: "left",
  },
  {
    label: "Last month",
    value: [
      startOfMonth(addMonths(new Date(), -1)),
      endOfMonth(addMonths(new Date(), -1)),
    ],
    placement: "left",
  },
  {
    label: "This year",
    value: [new Date(new Date().getFullYear(), 0, 1), new Date()],
    placement: "left",
  },
  {
    label: "Last week",
    closeOverlay: false,
    value: (value) => {
      const [start = new Date()] = value || [];
      return [
        addDays(startOfWeek(start, { weekStartsOn: 0 }), -7),
        addDays(endOfWeek(start, { weekStartsOn: 0 }), -7),
      ];
    },
    appearance: "default",
  },
];
const ScoreCard = () => {
  const { firstCard, secondCard, thirdCard } = useContext(ClickedValueContext);

  const { dateRange, updateDateRange } = useContext(DateRangeContext);
  const [timezone, setTimezone] = useState("");

  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState([]);
  const [teams, setTeams] = useState([]);
  const [channels, setChannels] = useState([]);
  const [groupedAgents, setGroupedAgents] = useState([]);
  const [kpiList, setKpiList] = useState([]);
  const [selectedKPIsFirstCard, setSelectedKPIsFirstCard] = useState(
    firstCard || "Touchpoint"
  );
  const [selectedKPIsSecondCard, setSelectedKPIsSecondCard] = useState(
    secondCard || "Touchpoint"
  );
  const [selectedKPIsThirdCard, setSelectedKPIsThirdCard] = useState(
    thirdCard || "Touchpoint"
  );
  const [cardDataForFirstCard, setCardDataForFirstCard] = useState(null);
  const [cardDataForSecondCard, setCardDataForSecondCard] = useState(null);
  const [cardDataForThirdCard, setCardDataForThirdCard] = useState(null);

  const [teamData, setTeamData] = useState({});
  const [groupData, setGroupData] = useState({});
  const [topicData, setTopicData] = useState({});
  const [groupeFirstCard, setGroupeFirstCard] = useState({
    name: "Zendesk Groupes",
    id: "zendesk",
  });
  const [dynamicFilterSetFirstCard, setDynamicFilterSetFirstCard] = useState(
    []
  );
  const [groupeSecondCard, setGroupeSecondCard] = useState({
    name: "Zendesk Groupes",
    id: "zendesk",
  });
  const [dynamicFilterSetSecondCard, setDynamicFilterSetSecondCard] = useState(
    []
  );
  const [groupeThirdCard, setGroupeThirdCard] = useState({
    name: "Zendesk Groupes",
    id: "zendesk",
  });
  const [dynamicFilterSetThirdCard, setDynamicFilterSetThirdCard] = useState(
    []
  );
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isIngestionInProgress, setIsIngestionInProgress] = useState(false);

  const [tooltips, setTooltips] = useState(null);

  useEffect(() => {
    // Get the user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Set the timezone in the state
    setTimezone(userTimezone);
  }, []);

  useEffect(() => {
    const fetchTooltips = async () => {
      try {
        const response = await axios.get(ApiConfig.analyticsTooltips); // Adjust URL as needed
        console.log(response)
        setTooltips(response.data);
      } catch (err) {
        console.log(err)
      }
    };

    fetchTooltips();
  }, []);

  useEffect(() => {
    const handleIngestionStatus = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      try {
        setIsLoadingGroups(true);
        const res = await axios.get(ApiConfig.ingestionRunningStatus, config);
        setIsIngestionInProgress(res.data.ingestion_in_progress);
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error);
      } finally {
        setIsLoadingGroups(false);
      }
    };
    handleIngestionStatus();
  }, []);

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      const adjustedStart = startOfDay(start);
      const adjustedEnd = endOfDay(end);
      updateDateRange(adjustedStart, adjustedEnd);
    }
  };

  const handleTeamChange = (e) => {
    const selectedTeam = e.value;
    setSelectedTeam(selectedTeam);
  };

  const handleAgentChange = (e) => {
    const selectedAgents = e.value;
    setSelectedAgents(selectedAgents);
  };
  useEffect(() => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    axios
      .get(ApiConfig.analyticsFilter, config)
      .then((response) => {
        const data = response.data;

        const mappedTeamData = Object.entries(data?.teams).map(
          ([key, value]) => ({
            id: key,
            value: key,
          })
        );
        setTeamData(mappedTeamData);
        const mappedGroupData = data.groups.map((item) => ({
          id: item.id,
          value: item.name,
        }));
        setGroupData(mappedGroupData);
        const mappedTopicData = data.topic_names.map((topic) => ({
          id: topic,
          value: topic,
        }));
        setTopicData(mappedTopicData);

        const teamNames = Object.keys(data.teams);
        const channelNames = data.channel_names;

        const mappedTeams = teamNames.map((name) => ({
          label: name,
          value: name,
        }));
        setTeams(mappedTeams);

        const mappedGroupedAgents = teamNames.map((teamName) => ({
          label: teamName,
          items: data.teams[teamName].members.map((member) => ({
            label: member.name,
            value: member.id,
          })),
        }));
        setGroupedAgents(mappedGroupedAgents);

        const mappedKpiList = Object.keys(data.kip_list).map((category) => ({
          label: category,
          items: data.kip_list[category].map((kpi) => ({
            label: kpi,
            value: kpi,
          })),
        }));
        setKpiList(mappedKpiList);
        const mappedChannels = channelNames.map((name) => ({
          label: name,
          value: name,
        }));
        setChannels(mappedChannels);
      })
      .catch((error) =>
        toast.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        })
      );
  }, []);

  const fetchCardData = async (cardIndex, cardFilters, groupe) => {
    try {
      switch (cardIndex) {
        case 1:
          setCardDataForFirstCard(null);
          break;
        case 2:
          setCardDataForSecondCard(null);
          break;
        case 3:
          setCardDataForThirdCard(null);
          break;
        default:
          break;
      }
      const daysDifference =
        (dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24);

      let period = "D";
      if (daysDifference > 90) {
        period = "M";
      } else if (daysDifference > 21) {
        period = "W";
      }

      const cardDataPayload = {
        global_filter: {
          selected_groups: cardFilters.selected_groups,
          selected_channels: cardFilters.selected_channels,
          selected_agents: cardFilters.selected_agents,
          selected_teams: cardFilters.selected_teams,
          selected_topics: cardFilters.selected_topics,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        },
        selected_kpi: cardFilters.selected_kpi,
        group_by: groupe?.id,
        period: period,
      };
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };

      const cardDataResponse = await axios.post(
        ApiConfig.analyticsAgentList,
        cardDataPayload,
        config
      );
      const cardData = cardDataResponse.data;

      switch (cardIndex) {
        case 1:
          setCardDataForFirstCard(cardData);
          break;
        case 2:
          setCardDataForSecondCard(cardData);
          break;
        case 3:
          setCardDataForThirdCard(cardData);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    }
  };

  useEffect(() => {
    fetchCardData(
      1,
      {
        selected_groups:
          groupeFirstCard.id === "zendesk" ? dynamicFilterSetFirstCard : [],
        selected_channels: selectedChannel,
        selected_agents: selectedAgents,
        selected_teams:
          groupeFirstCard.id === "team"
            ? dynamicFilterSetFirstCard
            : selectedTeam,
        selected_topics:
          groupeFirstCard.id === "topic" ? dynamicFilterSetFirstCard : [],
        selected_kpi: selectedKPIsFirstCard,
        start_date: dateRange,
        end_date: dateRange,
      },
      groupeFirstCard
    );
  }, [
    selectedKPIsFirstCard,
    selectedTeam,
    selectedAgents,
    selectedChannel,
    dateRange.startDate,
    dateRange.endDate,
    dynamicFilterSetFirstCard,
  ]);

  useEffect(() => {
    fetchCardData(
      2,
      {
        selected_groups:
          groupeSecondCard.id === "zendesk" ? dynamicFilterSetSecondCard : [],
        selected_channels: selectedChannel,
        selected_agents: selectedAgents,
        selected_teams:
          groupeSecondCard.id === "team"
            ? dynamicFilterSetSecondCard
            : selectedTeam,
        selected_topics:
          groupeSecondCard.id === "topic" ? dynamicFilterSetSecondCard : [],
        selected_kpi: selectedKPIsSecondCard,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      },
      groupeSecondCard
    );
  }, [
    selectedKPIsSecondCard,
    selectedTeam,
    selectedAgents,
    selectedChannel,
    dateRange.startDate,
    dateRange.endDate,
    dynamicFilterSetSecondCard,
  ]);

  useEffect(() => {
    fetchCardData(
      3,
      {
        selected_groups:
          groupeThirdCard.id === "zendesk" ? dynamicFilterSetThirdCard : [],
        selected_channels: selectedChannel,
        selected_agents: selectedAgents,
        selected_teams:
          groupeThirdCard.id === "team"
            ? dynamicFilterSetThirdCard
            : selectedTeam,
        selected_topics:
          groupeThirdCard.id === "topic" ? dynamicFilterSetThirdCard : [],
        selected_kpi: selectedKPIsThirdCard,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      },
      groupeThirdCard
    );
  }, [
    selectedKPIsThirdCard,
    selectedTeam,
    selectedAgents,
    selectedChannel,
    dateRange.startDate,
    dateRange.endDate,
    dynamicFilterSetThirdCard,
  ]);

  if (isLoadingGroups) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (isIngestionInProgress) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "80vh",
        }}
      >
        <p>
          Legacy ticket processing is in process. Click on Feature Management
          --&gt; Settings for status. Dashboard will appear once processing is
          complete
        </p>
      </div>
    );
  }
  
  return (
    <FilterProvider>
      <Card.Body className="pb-0 mb-2">
        <Card className="h-100">
          <div className="d-flex">
            <h4 className="text-primary m-4 mt-2 mb-2 d-sm-none d-lg-block d-lg-flex align-items-center">
              ScoreCards
            </h4>
            <Row className="m-3 justify-content-end text-center w-100">
              <Col lg={3}>
                <FalconComponentCard noGuttersBottom>
                  <DateRangePicker
                    data-tooltip-id="date_picker"
                    ranges={predefinedRanges}
                    value={[dateRange.startDate, dateRange.endDate]}
                    onChange={handleDateRangeChange}
                    showOneCalendar
                    shouldDisableDate={afterToday()}
                  />
                  <ReactTooltip
                    id="date_picker"
                    place="bottom"
                    content={tooltips?.date_picker}
                    style={{ zIndex: "9999" }}
                    delayShow={200}
                  />
                </FalconComponentCard>
              </Col>
              <Col md={3}>
                <MultiSelect
                  data-tooltip-id="team_dropdown"
                  value={selectedTeam}
                  options={teams}
                  optionLabel="label"
                  onChange={handleTeamChange}
                  placeholder="Select Team"
                  maxSelectedLabels={1}
                  className="w-full md:w-20rem"
                  panelClassName={teams.length > 0 ? "" : "hidden-checkbox"}
                />
                <ReactTooltip
                  id="team_dropdown"
                  place="bottom"
                  content={tooltips?.team_dropdown}
                  style={{ zIndex: "9999" }}
                  delayShow={200}
                />
              </Col>
              <Col md={3}>
                <MultiSelect
                  aria-label="Options"
                  data-tooltip-id="agent_dropdown"
                  value={selectedAgents}
                  options={groupedAgents}
                  optionLabel="label"
                  optionGroupLabel="label"
                  optionGroupChildren="items"
                  onChange={handleAgentChange}
                  maxSelectedLabels={1}
                  placeholder="Select Agents"
                  className="w-full md:w-20rem"
                  filter
                  panelClassName={
                    groupedAgents.length > 0 ? "" : "hidden-checkbox"
                  }
                />
                <ReactTooltip
                  id="agent_dropdown"
                  place="bottom"
                  content={tooltips?.agent_dropdown}
                  style={{ zIndex: "9999" }}
                  delayShow={200}
                />
              </Col>
              <Col md={3}>
                <MultiSelect
                  data-tooltip-id="channel_dropdown"
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.value)}
                  options={channels}
                  optionLabel="label"
                  placeholder="Select Channels"
                  maxSelectedLabels={1}
                  className="w-full md:w-20rem"
                  panelClassName={channels.length > 0 ? "" : "hidden-checkbox"}
                />
                <ReactTooltip
                  id="channel_dropdown"
                  place="bottom"
                  content={tooltips?.channel_dropdown}
                  style={{ zIndex: "9999" }}
                  delayShow={200}
                />
              </Col>
            </Row>
          </div>
        </Card>
      </Card.Body>
      <Row className="mb-3 mt-2">
        <Col xxl={14}>
          <div>
            <Row className="g-4 mb-3 mt-2">
              <Col md={4}>
                <FirstCard
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  kpiList={kpiList}
                  selectedTeams={selectedTeam}
                  selectedAgent={selectedAgents}
                  selectedChannels={selectedChannel}
                  selectedKPIs={selectedKPIsFirstCard}
                  setSelectedKPIs2={setSelectedKPIsFirstCard}
                  setDynamicFilterSetAgent={setDynamicFilterSetFirstCard}
                  setGroupeAgent={setGroupeFirstCard}
                  cardData={cardDataForFirstCard}
                  teamData={teamData}
                  topicData={topicData}
                  groupData={groupData}
                  tooltips={tooltips}
                />
              </Col>
              <Col md={4}>
                <SecondCard
                  endDate={dateRange.endDate}
                  startDate={dateRange.startDate}
                  kpiList={kpiList}
                  selectedTeams={selectedTeam}
                  selectedAgent={selectedAgents}
                  selectedChannels={selectedChannel}
                  selectedKPIs={selectedKPIsSecondCard}
                  setSelectedKPIs2={setSelectedKPIsSecondCard}
                  setDynamicFilterSetAgent={setDynamicFilterSetSecondCard}
                  setGroupeAgent={setGroupeSecondCard}
                  cardData={cardDataForSecondCard}
                  teamData={teamData}
                  topicData={topicData}
                  groupData={groupData}
                  tooltips={tooltips}
                />
              </Col>
              <Col md={4}>
                <ThirdCard
                  endDate={dateRange.endDate}
                  startDate={dateRange.startDate}
                  kpiList={kpiList}
                  selectedTeams={selectedTeam}
                  selectedAgent={selectedAgents}
                  selectedChannels={selectedChannel}
                  selectedKPIs={selectedKPIsThirdCard}
                  setSelectedKPIs2={setSelectedKPIsThirdCard}
                  setDynamicFilterSetAgent={setDynamicFilterSetThirdCard}
                  setGroupeAgent={setGroupeThirdCard}
                  cardData={cardDataForThirdCard}
                  teamData={teamData}
                  topicData={topicData}
                  groupData={groupData}
                  tooltips={tooltips}
                />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </FilterProvider>
  );
};

export default ScoreCard;
